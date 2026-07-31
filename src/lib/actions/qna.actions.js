"use server";

import { getHeaders } from "@lib/auth-server";
import { fetchProductQnA, submitProductQuestion } from "@services/LaravelQnA";

export async function getProductQnAAction(productId) {
  try {
    const qna = await fetchProductQnA(productId);
    return { success: true, qna, error: null };
  } catch (error) {
    return { success: false, qna: [], error: error.message };
  }
}

export async function submitProductQuestionAction(productId, question) {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) {
      return { success: false, error: "Please log in to ask a question" };
    }
    const data = await submitProductQuestion(headers, { productId, question });
    if (data?.success === false) {
      return { success: false, error: data.message || "Failed to submit question" };
    }
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
