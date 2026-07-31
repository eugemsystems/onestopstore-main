"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  baseURL,
  handleResponse,
  resilientFetch,
} from "@services/CommonService";
import { getAuthToken } from "@lib/auth-server";
import {
  toTemplateOrderListItem,
  toTemplateOrderDetail,
} from "@services/LaravelCheckout";

/**
 * Get customer orders
 */
export async function getCustomerOrders({ page = 1, limit = 10 } = {}) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        data: null,
        error: "Unauthorized",
      };
    }

    const response = await resilientFetch(
      `${baseURL}/order?page=${page}&paginate=${limit}`,
      {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 0 }, // No cache for orders
      },
    );

    const payload = await handleResponse(response);
    const rows = payload?.data || payload || [];

    const data = {
      orders: rows.map(toTemplateOrderListItem),
      totalDoc: Number(payload?.total) || rows.length,
    };

    return {
      success: true,
      data,
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
 * Get order by ID
 */
export async function getOrderById(orderId) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        order: null,
        error: "Unauthorized",
      };
    }

    const response = await resilientFetch(`${baseURL}/order/${orderId}`, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "en",
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });

    const rawOrder = await handleResponse(response);
    const order = toTemplateOrderDetail(rawOrder);

    return {
      success: true,
      order,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      order: null,
      error: error.message,
    };
  }
}

/**
 * Create new order
 */
export async function createOrder(orderData) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        order: null,
        error: "Unauthorized",
      };
    }

    const response = await resilientFetch(`${baseURL}/order/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    const order = await handleResponse(response);

    return {
      success: true,
      order,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      order: null,
      error: error.message,
    };
  }
}
