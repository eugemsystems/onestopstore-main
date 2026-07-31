"use server";

import { baseURL, handleResponse, resilientFetch } from "@services/CommonService";
import { getHeaders } from "@lib/auth-server";
import { toTemplateOrderDetail } from "@services/LaravelCheckout";

/**
 * Track order by order number.
 *
 * SCOPE NOTE: the template's original backend modeled live delivery
 * tracking — GPS timeline events and an assigned "delivery boy" with a
 * rating. The Raines Laravel API has neither concept (no rider entity, no
 * tracking-events table) — it only has order_status
 * (pending/processing/delivered/...). There is also no PUBLIC lookup
 * route: GET /order/{n} requires the Bearer token of the order's OWNER
 * (confirmed live: an unauthenticated request returns 401).
 *
 * So this is no longer public parcel tracking by a bare code — it's
 * "check the status of an order you placed," gated by your session, with
 * an empty tracking timeline and no delivery-boy card (both render their
 * empty states gracefully — see TrackingPageClient.jsx).
 */
export async function trackOrder(trackingId) {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) {
      return {
        success: false,
        data: null,
        error: "Please sign in to track your order.",
      };
    }

    const response = await resilientFetch(`${baseURL}/order/${trackingId}`, {
      headers,
      next: { revalidate: 0 },
    });

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        data: null,
        error: "This order does not belong to your account.",
      };
    }

    const rawOrder = await handleResponse(response);
    const order = toTemplateOrderDetail(rawOrder);
    const addr = rawOrder?.billing_address || rawOrder?.shipping_address;

    return {
      success: true,
      data: {
        order: {
          ...order,
          city: addr?.city || "",
          country: addr?.country?.name || "",
          zipCode: addr?.pincode || "",
        },
        tracking: {}, // no GPS/timeline events in this API
        deliveryBoy: null, // no rider entity in this API
      },
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
}

/**
 * Rate delivery boy for an order.
 * NOT WIRED — the Raines Laravel API has no delivery-rider entity or
 * rating endpoint. RateDelivery.jsx only renders when `order?.deliveryBoy`
 * is present, which trackOrder() above never sets, so this action is
 * currently unreachable from the UI.
 */
export async function rateDeliveryBoy({ orderId, rating, review }) {
  return {
    success: false,
    error: "Delivery ratings are not supported by this store.",
  };
}
