"use server";

import { getHeaders } from "@lib/auth-server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  fetchPublicReviews,
  createLaravelReview,
  updateLaravelReview,
  deleteLaravelReview,
} from "@services/LaravelReviews";

/**
 * Review services — Raines Laravel edition.
 * Laravel's contract (verified live): public listing is `/front/review`,
 * writes go through singular `/review` (not the template's original
 * `/reviews`). Field names are also remapped: the ReviewModal form sends
 * {comment, rating, product, images}; Laravel wants
 * {description, rating, product_id}.
 */

const getReviewsByProduct = async (productId) => {
  try {
    const reviews = await fetchPublicReviews(productId);
    return { reviews, error: null, loading: false };
  } catch (error) {
    return { reviews: [], error: error.message, loading: false };
  }
};

/**
 * "Products awaiting review" dashboard — Laravel has no bulk endpoint for
 * this (no `/reviews/purchased-products` equivalent), so it's not wired.
 * Returns an empty list rather than erroring; the my-reviews page will just
 * show its empty state until this is built against real order history.
 */
const getUserPurchasedProducts = async ({ page, limit }) => {
  return { reviews: [], error: null, loading: false };
};

const addReview = async (reviewData) => {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) {
      return { review: null, error: "Please sign in to submit a review." };
    }

    const review = await createLaravelReview(headers, {
      productId: reviewData?.product,
      rating: reviewData?.rating,
      description: reviewData?.comment || "",
    });

    if (review?.success === false) {
      return { review: null, error: review?.message || "Failed to submit review" };
    }

    revalidateTag("reviewed_products");
    revalidateTag("store_products");
    revalidateTag(`review-${reviewData?.product}`);
    return { review, error: null, loading: false };
  } catch (error) {
    return { review: null, error: error.message, loading: false };
  }
};

const updateReview = async (reviewData) => {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) {
      return { review: null, error: "Please sign in to edit your review." };
    }

    const review = await updateLaravelReview(headers, reviewData?.reviewId, {
      rating: reviewData?.rating,
      description: reviewData?.comment || "",
    });

    if (review?.success === false) {
      return { review: null, error: review?.message || "Failed to update review" };
    }

    revalidatePath(`/user/my-reviews`);
    revalidateTag(`review-${reviewData?.product}`);
    return { review, error: null, loading: false };
  } catch (error) {
    return { review: null, error: error.message, loading: false };
  }
};

const deleteReview = async (reviewId) => {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) {
      return { review: null, error: "Please sign in." };
    }

    const review = await deleteLaravelReview(headers, reviewId);
    return { review, error: null, loading: false };
  } catch (error) {
    return { review: null, error: error.message, loading: false };
  }
};

export {
  addReview,
  updateReview,
  deleteReview,
  getReviewsByProduct,
  getUserPurchasedProducts,
};
