import { baseURL, handleResponse, resilientFetch } from "@services/CommonService";
import { unwrapList, upgradeMediaUrl } from "@services/laravelAdapter";

/**
 * Product Q&A bridge.
 * Contract (verified against the live API):
 *   GET  /question-and-answer?product_id=   public list, no auth
 *   POST /question-and-answer  {product_id, question}   requires auth
 */

const jsonHeaders = (extra = {}) => ({
  Accept: "application/json",
  "Accept-Language": "en",
  "Content-Type": "application/json",
  ...extra,
});

/** Laravel Q&A row -> the shape ProductQnA.jsx reads */
export function toTemplateQnA(row) {
  return {
    _id: String(row?.id ?? ""),
    question: row?.question || "",
    answer: row?.answer || null,
    createdAt: row?.created_at,
    consumerId: row?.consumer_id ?? null,
    user: {
      name: row?.consumer?.name || "Customer",
      image: upgradeMediaUrl(row?.consumer?.profile_image?.original_url) || null,
    },
  };
}

/** Public Q&A list for a product (no auth required) */
export async function fetchProductQnA(productId) {
  const res = await resilientFetch(
    `${baseURL}/question-and-answer?product_id=${productId}&paginate=50`,
    {
      headers: jsonHeaders(),
      next: { revalidate: 60, tags: ["qna", `qna-${productId}`] },
    },
  );
  const payload = await handleResponse(res);
  return unwrapList(payload).map(toTemplateQnA);
}

/** Submit a new question — requires the Bearer-token headers from getHeaders() */
export async function submitProductQuestion(headers, { productId, question }) {
  const res = await resilientFetch(`${baseURL}/question-and-answer`, {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify({ product_id: productId, question }),
  });
  return handleResponse(res);
}
