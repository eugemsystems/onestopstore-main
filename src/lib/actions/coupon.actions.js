"use server";

import {
  baseURL,
  handleResponse,
  resilientFetch,
} from "@services/CommonService";

/**
 * Validate coupon code
 */
export async function validateCoupon(couponCode, cartTotal = 0) {
  try {
    const response = await resilientFetch(`${baseURL}/coupon/verify/${couponCode}`, {
      next: { revalidate: 0 },
    });

    const coupon = await handleResponse(response);

    // Check minimum purchase requirement if exists
    if (coupon.minimumAmount && cartTotal < coupon.minimumAmount) {
      return {
        success: false,
        coupon: null,
        error: `Minimum order amount of $${coupon.minimumAmount} required`,
      };
    }

    return {
      success: true,
      coupon,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      coupon: null,
      error: error.message || "Invalid coupon code",
    };
  }
}

/**
 * Get coupon by code
 */
export async function getCouponByCode(couponCode) {
  try {
    const response = await resilientFetch(`${baseURL}/coupon/verify/${couponCode}`, {
      next: { revalidate: 300, tags: ["coupon", `coupon-${couponCode}`] },
    });

    const coupon = await handleResponse(response);

    return {
      success: true,
      coupon,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      coupon: null,
      error: error.message || "Coupon not found",
    };
  }
}

/**
 * Get all active coupons
 */
export async function getActiveCoupons() {
  try {
    const response = await resilientFetch(`${baseURL}/coupon/show`, {
      next: { revalidate: 120, tags: ["coupons"] },
    });

    const coupons = await handleResponse(response);

    return {
      success: true,
      coupons: coupons || [],
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      coupons: [],
      error: error.message,
    };
  }
}
