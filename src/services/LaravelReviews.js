import { baseURL, handleResponse, resilientFetch } from "@services/CommonService";
import { unwrapList, upgradeMediaUrl } from "@services/laravelAdapter";

/**
 * Laravel review bridge.
 * Contract (verified against the live API):
 *   GET    /front/review?product_id=   public list, no auth
 *   GET    /review?product_id=         authed list (used for edit-ownership checks)
 *   POST   /review     {product_id, rating, description}   requires a prior purchase
 *   PUT    /review/{id} {rating, description}
 *   DELETE /review/{id}
 */

const jsonHeaders = (extra = {}) => ({
  Accept: "application/json",
  "Accept-Language": "en",
  "Content-Type": "application/json",
  ...extra,
});

/** Laravel review row -> the shape ProductReviews.jsx / CustomerQA read */
export function toTemplateReview(row) {
  return {
    _id: String(row?.id ?? ""),
    rating: Number(row?.rating || 0),
    comment: row?.description || "",
    createdAt: row?.created_at,
    images: [],
    user: {
      name: row?.consumer?.name || "Anonymous",
      image: upgradeMediaUrl(row?.consumer?.profile_image?.original_url) || null,
    },
  };
}

/** Public review list for a product (no auth required) */
export async function fetchPublicReviews(productId) {
  const res = await resilientFetch(
    `${baseURL}/front/review?product_id=${productId}&paginate=50`,
    {
      headers: jsonHeaders(),
      next: { revalidate: 60, tags: ["reviews", `review-${productId}`] },
    },
  );
  const payload = await handleResponse(res);
  return unwrapList(payload).map(toTemplateReview);
}

/** Create a review — {product_id, rating, description}. `headers` is the
 *  object from lib/auth-server's getHeaders() (already carries the Bearer
 *  token + content-type). */
export async function createLaravelReview(headers, { productId, rating, description }) {
  const res = await resilientFetch(`${baseURL}/review`, {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify({ product_id: productId, rating, description }),
  });
  return handleResponse(res);
}

/** Update an existing review */
export async function updateLaravelReview(headers, reviewId, { rating, description }) {
  const res = await resilientFetch(`${baseURL}/review/${reviewId}`, {
    method: "PUT",
    headers,
    cache: "no-store",
    body: JSON.stringify({ rating, description }),
  });
  return handleResponse(res);
}

/** Delete a review */
export async function deleteLaravelReview(headers, reviewId) {
  const res = await resilientFetch(`${baseURL}/review/${reviewId}`, {
    method: "DELETE",
    headers,
    cache: "no-store",
  });
  return handleResponse(res);
}
