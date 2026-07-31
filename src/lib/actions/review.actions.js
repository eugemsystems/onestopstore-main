"use server";

import { cookies } from "next/headers";
import {
  baseURL,
  handleResponse,
  resilientFetch,
} from "@services/CommonService";
import { getAuthToken, getHeaders } from "@lib/auth-server";
import {
  fetchPublicReviews,
  createLaravelReview,
} from "@services/LaravelReviews";

/**
 * Get product reviews — public `/front/review` (no auth)
 */
export async function getProductReviews(productId) {
  try {
    const reviews = await fetchPublicReviews(productId);
    return {
      success: true,
      reviews,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      reviews: [],
      error: error.message,
    };
  }
}

/**
 * Add product review — Laravel singular `/review`, requires a prior
 * purchase of the product. `reviewData` uses the template's field names
 * (productId/rating/comment); mapped to Laravel's {product_id,rating,description}.
 */
export async function addReview(reviewData) {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) {
      return {
        success: false,
        error: "Please login to submit a review",
      };
    }

    const review = await createLaravelReview(headers, {
      productId: reviewData?.productId ?? reviewData?.product,
      rating: reviewData?.rating,
      description: reviewData?.comment ?? reviewData?.description ?? "",
    });

    if (review?.success === false) {
      return {
        success: false,
        error: review?.message || "Failed to submit review",
      };
    }

    return {
      success: true,
      review,
      message: "Review submitted successfully",
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to submit review",
    };
  }
}

/**
 * Get customer reviews / "products awaiting review" dashboard.
 * NOTE: Laravel has no bulk endpoint for this (the template's original
 * backend had `/reviews/purchased-products`; this API doesn't). Wiring it
 * properly would mean cross-referencing every order's line items against
 * existing reviews per product — not implemented yet. Returns empty so the
 * my-reviews page renders its empty state instead of erroring.
 */
export async function getCustomerReviews() {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, reviews: [], error: "Unauthorized" };
  }
  return { success: true, reviews: [], error: null };
}

/**
 * Get user purchased products for review — see note on getCustomerReviews;
 * same Laravel gap, not wired.
 */
export async function getUserPurchasedProducts({ page = 1, limit = 30 } = {}) {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, reviews: [], error: "Unauthorized" };
  }
  return { success: true, reviews: [], error: null };
}
