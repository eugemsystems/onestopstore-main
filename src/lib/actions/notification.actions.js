"use server";

import {
  baseURL,
  handleResponse,
  resilientFetch,
} from "@services/CommonService";
import { getAuthToken } from "@lib/auth-server";

/**
 * Laravel's confirmed customer-notification contract (matching the legacy
 * frontend, see react-frontend/src/Utils/AxiosUtils/API.js):
 *   GET /notifications           -> { data: [{ id, data: { message }, read_at, created_at }] }
 *   PUT /notifications/markAsRead -> marks ALL of the customer's notifications
 *                                     as read (there is no per-notification
 *                                     read endpoint on this backend).
 */

/**
 * Get customer notifications
 */
export async function getCustomerNotifications({ page = 1, limit = 20 } = {}) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        data: null,
        error: "Unauthorized",
      };
    }

    const response = await resilientFetch(`${baseURL}/notifications`, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "en",
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });

    const payload = await handleResponse(response);
    const list = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];

    const totalDoc = list.length;
    const start = (page - 1) * limit;
    const notifications = list.slice(start, start + limit).map((n) => ({
      _id: n.id,
      title: n?.data?.title || "Notification",
      message: n?.data?.message || "",
      status: n?.read_at ? "read" : "unread",
      trackingId: n?.data?.trackingId || null,
      createdAt: n?.created_at,
    }));

    return {
      success: true,
      data: {
        notifications,
        unreadCount: list.filter((n) => !n.read_at).length,
        totalDoc,
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
 * Mark notifications as read. The backend only exposes a bulk "mark all"
 * endpoint, so a per-notification click also marks everything as read —
 * same behavior the legacy frontend relies on.
 */
async function markAsRead() {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, error: "Unauthorized" };
  }

  const response = await resilientFetch(`${baseURL}/notifications/markAsRead`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await handleResponse(response);
  return { success: true, message: data?.message, error: null };
}

export async function markNotificationRead() {
  try {
    return await markAsRead();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsRead() {
  try {
    return await markAsRead();
  } catch (error) {
    return { success: false, error: error.message };
  }
}
