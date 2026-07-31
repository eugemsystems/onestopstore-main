"use server";

import { getHeaders } from "@lib/auth-server";
import {
  checkLaybyExisting,
  applyForLayby,
  uploadLaybyDocumentFile,
  saveLaybyDocument,
} from "@services/LaravelLayby";

const guarded = async (fn) => {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) return { data: null, error: "Unauthorized" };
    const data = await fn(headers);
    if (data?.success === false) return { data: null, error: data.message };
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export async function checkLaybyExistingAction(productId, variationId) {
  return guarded((headers) => checkLaybyExisting(headers, { productId, variationId }));
}

export async function applyForLaybyAction({
  productId,
  durationMonths,
  variationId,
  selectedAttributeIds,
  variationDisplayName,
}) {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) return { data: null, error: "Unauthorized" };
    const { ok, status, data } = await applyForLayby(headers, {
      productId,
      durationMonths,
      variationId,
      selectedAttributeIds,
      variationDisplayName,
    });
    if (!ok) {
      return {
        data: null,
        error: data?.message || `Request failed (${status})`,
        existingApplication: data?.existing_application || null,
      };
    }
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

// FormData from the client: { file: File, applicationId, docType, docNumber }
export async function submitLaybyDocumentAction(formData) {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) return { data: null, error: "Unauthorized" };

    const file = formData.get("file");
    const applicationId = formData.get("applicationId");
    const docType = formData.get("docType");
    const docNumber = formData.get("docNumber");
    if (!file || !applicationId || !docType || !docNumber) {
      return { data: null, error: "Missing required document fields" };
    }

    const attachment = await uploadLaybyDocumentFile(headers, file);
    const data = await saveLaybyDocument(headers, applicationId, {
      attachmentId: attachment.id,
      docType,
      docNumber,
    });
    if (data?.success === false) return { data: null, error: data.message };
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}
