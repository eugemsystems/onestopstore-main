"use server";

import { baseURL, handleResponse, resilientFetch } from "@services/CommonService";
import { toTemplateProduct, unwrapList } from "@services/laravelAdapter";
import { getHeaders } from "@lib/auth-server";

async function fetchProductList(path) {
  const headers = await getHeaders();
  if (!headers.authorization) {
    return { success: false, products: [], error: "Unauthorized" };
  }
  try {
    const res = await resilientFetch(`${baseURL}${path}`, {
      headers,
      cache: "no-store",
    });
    const payload = await handleResponse(res);
    const products = unwrapList(payload).map(toTemplateProduct).filter(Boolean);
    return { success: true, products, error: null };
  } catch (error) {
    return { success: false, products: [], error: error.message };
  }
}

export async function getWishlistProductsAction() {
  return fetchProductList("/wishlist?paginate=100");
}

export async function getCompareProductsAction() {
  return fetchProductList("/compare?paginate=100");
}
