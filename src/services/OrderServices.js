"use server";

import { getHeaders } from "@lib/auth-server";
import {
  baseURL,
  handleResponse,
  resilientFetch,
} from "@services/CommonService";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  toLaravelProducts,
  toLaravelPaymentMethod,
  fetchCheckoutTotals,
  placeLaravelOrder,
  toTemplateOrderResponse,
  isRedirectGateway,
  fetchGatewayRedirect,
} from "@services/LaravelCheckout";

/** Build the /checkout totals-preview payload from explicit checkout-page selections. */
const buildTotalsPayload = (orderInfo, products) => ({
  consumer_id: orderInfo?.consumer_id,
  billing_address_id: orderInfo?.billing_address_id,
  shipping_address_id: orderInfo?.shipping_address_id,
  payment_method: toLaravelPaymentMethod(orderInfo?.paymentMethod),
  delivery_title: orderInfo?.shippingOption || "Standard",
  delivery_description: orderInfo?.shippingOption || "Standard Delivery",
  // Laravel does not price the chosen delivery method itself — it only
  // echoes back whatever `delivery_price` it's given and folds that into
  // `total`. Omitting this understates every total by the full delivery
  // fee (confirmed live: same payload without it returns total=51.8,
  // with delivery_price:15 it returns total=66.8, delivery_price:15).
  delivery_price: Number(orderInfo?.delivery_price ?? 0),
  coupon_code: orderInfo?.coupon_code || "",
  points_amount: orderInfo?.points_amount ? 1 : 0,
  wallet_balance: orderInfo?.wallet_balance ? 1 : 0,
  note: orderInfo?.note ? String(orderInfo.note) : "",
  products: products.map(({ product_id, variation_id, quantity }) => ({
    product_id,
    variation_id,
    quantity,
  })),
});

const addOrder = async (orderInfo) => {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) {
      return { error: "Please sign in to place your order." };
    }

    if (!orderInfo?.billing_address_id || !orderInfo?.shipping_address_id) {
      return { error: "Please choose a billing and shipping address." };
    }

    const products = toLaravelProducts(orderInfo?.cart);
    if (products.length === 0) {
      return { error: "Your cart is empty." };
    }

    const paymentMethod = toLaravelPaymentMethod(orderInfo?.paymentMethod);

    // Authoritative totals from Laravel (never trust client math)
    const totalsRes = await fetchCheckoutTotals(
      headers,
      buildTotalsPayload(orderInfo, products),
    );
    const totals = totalsRes?.total || {};

    // Place the order
    const orderPayload = {
      consumer_id: orderInfo?.consumer_id,
      billing_address_id: orderInfo.billing_address_id,
      shipping_address_id: orderInfo.shipping_address_id,
      payment_method: paymentMethod,
      delivery_title: orderInfo?.shippingOption || "Standard",
      delivery_description: orderInfo?.shippingOption || "Standard Delivery",
      delivery_price: Number(totals.delivery_price ?? 0),
      coupon_code: orderInfo?.coupon_code || "",
      points_amount: orderInfo?.points_amount ? 1 : 0,
      wallet_balance: orderInfo?.wallet_balance ? 1 : 0,
      note: orderInfo?.note ? String(orderInfo.note) : "",
      currency: "USD",
      currency_symbol: "$",
      sub_total: Number(totals.sub_total ?? 0),
      shipping_total: Number(totals.shipping_total ?? 0),
      tax_total: Number(totals.tax_total ?? 0),
      grand_total: Number(totals.total ?? 0),
      products,
    };

    const order = await placeLaravelOrder(headers, orderPayload);
    if (!order?.id) {
      return { error: order?.message || "Order could not be placed." };
    }

    const orderResponse = toTemplateOrderResponse(
      order,
      orderInfo?.user_info?.name,
    );

    // Online gateways: ensure a redirect URL is attached (order response
    // first, /rePayment as fallback) so the client can hand off to payment
    if (
      isRedirectGateway(paymentMethod) &&
      !orderResponse.payment_url &&
      !orderResponse.redirect_url
    ) {
      const url = await fetchGatewayRedirect(
        headers,
        order.order_number,
        paymentMethod,
      );
      if (url) orderResponse.payment_url = url;
    }

    revalidateTag("user-orders");
    revalidateTag("reviewed_products");
    revalidateTag("store_products");

    return {
      orderResponse,
    };
  } catch (error) {
    return {
      error: error.message,
    };
  }
};

/**
 * Live totals preview (subtotal/shipping/tax/coupon discount/wallet/points)
 * from Laravel's authoritative /checkout endpoint, without placing the
 * order. Re-run on every relevant checkout-page change (address, delivery
 * option, coupon, wallet/points toggle) so the summary always matches what
 * /order will actually charge — safe to call repeatedly since it only reads
 * (unlike the old free-text-address flow, this never creates address rows).
 */
const previewCheckoutTotals = async (orderInfo) => {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) {
      return { error: "Please sign in to see checkout totals." };
    }

    if (!orderInfo?.billing_address_id || !orderInfo?.shipping_address_id) {
      return { error: "Please choose a billing and shipping address." };
    }

    const products = toLaravelProducts(orderInfo?.cart);
    if (products.length === 0) {
      return { error: "Your cart is empty." };
    }

    const totalsRes = await fetchCheckoutTotals(
      headers,
      buildTotalsPayload(orderInfo, products),
    );
    if (!totalsRes?.total) {
      return { error: totalsRes?.message || "Could not calculate totals." };
    }

    return { totals: totalsRes.total };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Retry payment on an existing order whose payment is pending/failed —
 * mirrors the legacy frontend's "Pay Now" flow (PaynowModal -> /rePayment).
 */
const payOrderNow = async ({ orderNumber, paymentMethod }) => {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) {
      return { error: "Please sign in to make a payment." };
    }
    if (!orderNumber || !paymentMethod) {
      return { error: "Missing order number or payment method." };
    }

    const url = await fetchGatewayRedirect(
      headers,
      orderNumber,
      toLaravelPaymentMethod(paymentMethod),
    );
    if (!url) {
      return { error: "Could not start payment for this order." };
    }
    return { url };
  } catch (error) {
    return { error: error.message };
  }
};

const getOrderCustomer = async ({ page = 1, limit = 8 }) => {
  try {
    const response = await resilientFetch(
      `${baseURL}/order?limit=${limit}&page=${page}`,
      {
        // cache: "force-cache",

        next: {
          revalidate: 900,
          tags: ["user-orders"],
        },
        headers: await getHeaders(),
      },
    );

    const orders = await handleResponse(response);
    // console.log("orders::", orders);

    return {
      data: orders,
    };
  } catch (error) {
    // console.log("error", error);
    return {
      error: error.message,
    };
  }
};

const getOrderById = async ({ id }) => {
  try {
    const response = await resilientFetch(`${baseURL}/order/${id}`, {
      cache: "force-cache",
      headers: await getHeaders(),
    });

    const order = await handleResponse(response);
    // console.log("order::", order);

    return {
      data: order,
    };
  } catch (error) {
    // console.log("error", error);
    return {
      error: error.message,
    };
  }
};
//for sending email invoice to customer
const sendEmailInvoiceToCustomer = async (body) => {
  try {
    const response = await resilientFetch(`${baseURL}/order/customer/invoice`, {
      cache: "no-cache",
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify(body),
    });

    return await handleResponse(response);
  } catch (error) {
    return {
      error: error.message,
    };
  }
};

export {
  addOrder,
  previewCheckoutTotals,
  payOrderNow,
  getOrderCustomer,
  getOrderById,
  sendEmailInvoiceToCustomer,
};
