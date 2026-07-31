"use server";

import { baseURL, handleResponse, resilientFetch } from "@services/CommonService";

/** FAQ list — Laravel `GET /faq?status=1`. */
export async function getFaqs() {
  try {
    const response = await resilientFetch(`${baseURL}/faq?status=1`, {
      headers: { Accept: "application/json", "Accept-Language": "en" },
      next: { revalidate: 300, tags: ["faqs"] },
    });
    const payload = await handleResponse(response);
    const faqs = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    return { faqs, error: null };
  } catch (error) {
    return { faqs: [], error: error.message };
  }
}

/** Blog list — Laravel `GET /blog`. */
export async function getBlogs({ page = 1 } = {}) {
  try {
    const response = await resilientFetch(`${baseURL}/blog?page=${page}`, {
      headers: { Accept: "application/json", "Accept-Language": "en" },
      next: { revalidate: 300, tags: ["blogs"] },
    });
    const payload = await handleResponse(response);
    return {
      blogs: Array.isArray(payload?.data) ? payload.data : [],
      lastPage: payload?.last_page || 1,
      currentPage: payload?.current_page || 1,
      error: null,
    };
  } catch (error) {
    return { blogs: [], lastPage: 1, currentPage: 1, error: error.message };
  }
}

/** Single blog post — Laravel `GET /blog/slug/{slug}`. */
export async function getBlogBySlug(slug) {
  try {
    const response = await resilientFetch(`${baseURL}/blog/slug/${slug}`, {
      headers: { Accept: "application/json", "Accept-Language": "en" },
      next: { revalidate: 300, tags: [`blog-${slug}`] },
    });
    if (!response.ok) return { blog: null, error: null };
    const blog = await handleResponse(response);
    return { blog, error: null };
  } catch (error) {
    return { blog: null, error: error.message };
  }
}
