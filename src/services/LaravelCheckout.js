import { baseURL, handleResponse, resilientFetch } from "@services/CommonService";

/**
 * Laravel checkout bridge.
 * The checkout page selects billing_address_id/shipping_address_id
 * directly from the customer's real Laravel address book (see
 * AddressSelector.jsx + services/LaravelAddress.js), so this only needs to
 * handle: authoritative totals (POST /checkout) and placing the order
 * (POST /order). All calls run server-side with the customer's Bearer token.
 */

const jsonHeaders = (headers) => ({
  ...headers,
  Accept: "application/json",
  "Accept-Language": "en",
  "Content-Type": "application/json",
});

/**
 * Cart items (react-use-cart, built by useProductAction.handleAddToCart) ->
 * Laravel order products.
 *
 * `item.id` is the CART key — for variant products it's a composite
 * "<product._id>-<variant selections>" string (e.g. "9642-1054"), not a
 * valid Laravel product_id. The real product id is `item._id`; the
 * variant's id/name live under `item.variant`, not top-level
 * `variation_id`/`variation_display_name` fields (those never exist on the
 * real cart item shape). Using the wrong fields silently sent
 * product_id: null for every variant product — confirmed live via
 * Laravel's "Product ID is required for all items" rejection.
 */
export function toLaravelProducts(cartItems) {
  return (cartItems || []).map((item) => {
    const attributeIds = (item.variant?.attributes || [])
      .map((a) => a.id)
      .filter(Boolean);
    return {
      product_id: Number(item._id ?? item.product_id ?? item.id),
      variation_id: item.variant?.id ?? item.variation_id ?? null,
      selected_attribute_ids: attributeIds.length ? attributeIds : null,
      variation_display_name: item.variant?.name ?? item.variation_display_name ?? null,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
      item_shipping_method: item.item_shipping_method ?? "standard",
    };
  });
}

/** Authoritative totals from Laravel */
export async function fetchCheckoutTotals(headers, payload) {
  const res = await resilientFetch(`${baseURL}/checkout`, {
    method: "POST",
    headers: jsonHeaders(headers),
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/** Place the order */
export async function placeLaravelOrder(headers, payload) {
  const res = await resilientFetch(`${baseURL}/order`, {
    method: "POST",
    headers: jsonHeaders(headers),
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

const OFFLINE_METHODS = ["cod", "bank_transfer", "wallet"];

/** Is this a gateway that needs a redirect to complete payment? */
export function isRedirectGateway(method) {
  return !OFFLINE_METHODS.includes(String(method || "").toLowerCase());
}

/**
 * Gateway redirect fallback: if the order response carried no payment URL,
 * ask Laravel's /rePayment for one (same flow the legacy frontend uses).
 */
export async function fetchGatewayRedirect(headers, orderNumber, method) {
  try {
    const res = await resilientFetch(`${baseURL}/rePayment`, {
      method: "POST",
      headers: jsonHeaders(headers),
      cache: "no-store",
      body: JSON.stringify({
        order_number: orderNumber,
        payment_method: method,
        wallet_balance: 0,
        points_amount: 0,
      }),
    });
    const data = await handleResponse(res);
    return data?.payment_url || data?.redirect_url || data?.url || null;
  } catch {
    return null;
  }
}

/** Map template payment names to Laravel methods */
export function toLaravelPaymentMethod(method) {
  const m = String(method || "").toLowerCase();
  if (m === "cash" || m === "cod") return "cod";
  if (m === "card" || m === "stripe") return "stripe";
  return m || "cod";
}

/** Laravel order -> the response shape the template's success handler reads.
 *  NOTE: `_id` carries the order_number (not the row id) because Laravel's
 *  GET /order/{n} route resolves by order_number — the success page uses it. */
export function toTemplateOrderResponse(order, userName) {
  return {
    ...order,
    _id: String(order?.order_number ?? order?.id ?? ""),
    invoice: order?.order_number ?? order?.id,
    total: Number(order?.total ?? 0),
    trackingId: order?.order_number ?? null,
    createdAt: order?.created_at,
    user_info: { name: userName || "" },
  };
}

/** Laravel order-list row -> the shape OrderHistory.jsx reads */
export function toTemplateOrderListItem(order) {
  return {
    _id: String(order.order_number ?? order.id ?? ""),
    trackingId: order.order_number ?? order.id,
    createdAt: order.created_at,
    paymentMethod: order.payment_method,
    status: order.order_status?.name || order.order_status?.slug || "pending",
    shippingOption: order.delivery_description || "",
    shippingCost: Number(order.shipping_total ?? 0),
    total: Number(order.total ?? 0),
  };
}

/**
 * Full Laravel order detail (GET /order/{n}, with embedded products+pivot,
 * consumer, billing/shipping addresses) -> the shape the invoice/order-detail
 * pages read (`data.cart`, `data.user_info`, `data.invoice`, ...).
 */
export function toTemplateOrderDetail(order) {
  if (!order) return null;

  const addr = order.billing_address || order.shipping_address || {};
  const addressLine = [addr.street, addr.city, addr.country?.name]
    .filter(Boolean)
    .join(", ");

  const cart = (order.products || []).map((p) => {
    const quantity = Number(p.pivot?.quantity || 0);
    const price = Number(p.pivot?.single_price ?? p.pivot?.product_price ?? 0);
    return {
      title: p.pivot?.product_name || p.name,
      quantity,
      price,
      // OrderTable.jsx's "Amount" column reads itemTotal directly — without
      // it, every line item silently showed $0.00 (confirmed live on a real
      // order: qty 2 @ $39.28 rendered "Amount: $0.00").
      itemTotal: quantity * price,
      slug: p.pivot?.product_slug || p.slug,
      image: p.product_thumbnail?.image_url || p.product_thumbnail?.original_url,
    };
  });

  return {
    ...order,
    _id: String(order.order_number ?? order.id ?? ""),
    invoice: order.order_number ?? order.id,
    orderId: order.order_number ?? order.id,
    createdAt: order.created_at,
    status: order.order_status?.name || order.order_status?.slug,
    payment_status: String(order.payment_status || "").toUpperCase(),
    payment_method: order.payment_method,
    subTotal: Number(order.summary?.sub_total ?? order.amount ?? 0),
    shippingCost: Number(order.shipping_total ?? 0),
    discount: Number(order.coupon_total_discount ?? 0),
    taxAmount: Number(order.tax_total ?? 0),
    total: Number(order.total ?? 0),
    cart,
    user_info: {
      name: order.consumer?.name || "",
      email: order.consumer?.email || "",
      contact: order.consumer?.phone ? String(order.consumer.phone) : "",
      address: addressLine,
    },
  };
}
