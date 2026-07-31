import { baseURL, handleResponse, resilientFetch } from "@services/CommonService";

/**
 * Layby application bridge — ports the legacy frontend's LaybyModal.jsx flow
 * (apply -> upload ID document -> save) onto the real Laravel endpoints:
 *   GET  /layby/check-existing?product_id=&variation_id=
 *   POST /layby/apply                          {product_id, duration_months, variation_id?}
 *   POST /layby/documents/upload-chunk         multipart {uploadId, fileName, chunkIndex, totalChunks, chunk}
 *   POST /layby/documents/upload-complete      {uploadId, fileName, totalChunks} -> {attachment:{id,url}}
 *   PUT  /layby/applications/{id}/document      {id_document_attachment_id, id_document_type, id_document_number}
 *
 * The legacy uploader splits large files into 512KB chunks; ID photos are
 * small enough that we send the whole file as a single chunk (chunkIndex=0,
 * totalChunks=1) against the same wire protocol.
 */

const jsonHeaders = (headers) => ({
  ...headers,
  Accept: "application/json",
  "Accept-Language": "en",
  "Content-Type": "application/json",
});

// No explicit Content-Type here — fetch sets the multipart boundary itself
// when the body is a FormData instance. getHeaders() always bakes in
// "Content-Type: application/json", so it must be stripped, not merged.
const multipartHeaders = (headers) => {
  const { "Content-Type": _ct, "content-type": _ct2, ...rest } = headers || {};
  return { ...rest, Accept: "application/json", "Accept-Language": "en" };
};

export async function checkLaybyExisting(headers, { productId, variationId }) {
  const params = new URLSearchParams({ product_id: productId });
  if (variationId) params.set("variation_id", variationId);
  const res = await resilientFetch(`${baseURL}/layby/check-existing?${params}`, {
    headers: jsonHeaders(headers),
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function applyForLayby(
  headers,
  { productId, durationMonths, variationId, selectedAttributeIds, variationDisplayName },
) {
  const body = new FormData();
  body.append("product_id", productId);
  body.append("duration_months", durationMonths);
  if (variationId) body.append("variation_id", variationId);
  if (selectedAttributeIds?.length) {
    body.append("selected_attribute_ids", JSON.stringify(selectedAttributeIds));
  }
  if (variationDisplayName) body.append("variation_display_name", variationDisplayName);

  const res = await resilientFetch(`${baseURL}/layby/apply`, {
    method: "POST",
    headers: multipartHeaders(headers),
    cache: "no-store",
    body,
  });
  // Non-2xx here can still carry a meaningful payload (existing_application) —
  // let the caller read status + body instead of throwing away the response.
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

export async function uploadLaybyDocumentFile(headers, file) {
  const uploadId = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`;

  const chunkBody = new FormData();
  chunkBody.append("uploadId", uploadId);
  chunkBody.append("fileName", file.name);
  chunkBody.append("chunkIndex", "0");
  chunkBody.append("totalChunks", "1");
  chunkBody.append("chunk", file);

  const chunkRes = await resilientFetch(`${baseURL}/layby/documents/upload-chunk`, {
    method: "POST",
    headers: multipartHeaders(headers),
    cache: "no-store",
    body: chunkBody,
  });
  const chunkData = await handleResponse(chunkRes);
  if (!chunkData?.success) {
    throw new Error(chunkData?.message || "Failed to upload document");
  }

  const completeRes = await resilientFetch(`${baseURL}/layby/documents/upload-complete`, {
    method: "POST",
    headers: jsonHeaders(headers),
    cache: "no-store",
    body: JSON.stringify({ uploadId, fileName: file.name, totalChunks: 1 }),
  });
  const completeData = await handleResponse(completeRes);
  if (!completeData?.success) {
    throw new Error(completeData?.message || "Failed to finalize document upload");
  }
  return completeData.attachment; // { id, url }
}

export async function saveLaybyDocument(headers, applicationId, { attachmentId, docType, docNumber }) {
  const res = await resilientFetch(`${baseURL}/layby/applications/${applicationId}/document`, {
    method: "PUT",
    headers: jsonHeaders(headers),
    cache: "no-store",
    body: JSON.stringify({
      id_document_attachment_id: attachmentId,
      id_document_type: docType,
      id_document_number: docNumber,
    }),
  });
  return handleResponse(res);
}
