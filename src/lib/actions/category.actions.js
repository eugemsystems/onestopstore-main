"use server";

import {
  baseURL,
  handleResponse,
  resilientFetch,
} from "@services/CommonService";
import { toTemplateCategory, unwrapList } from "@services/laravelAdapter";

/**
 * Get showing categories — Laravel `/category?type=product`
 */
export async function getCategories() {
  try {
    const response = await resilientFetch(
      `${baseURL}/category?type=product&status=1`,
      {
        next: { revalidate: 300, tags: ["categories"] },
      },
    );

    const payload = await handleResponse(response);
    const categories = unwrapList(payload)
      .map(toTemplateCategory)
      .filter(Boolean);

    return {
      success: true,
      categories,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      categories: [],
      error: error.message,
    };
  }
}

/**
 * Get category by slug (searches the tree, including children)
 */
export async function getCategoryBySlug(slug) {
  try {
    const { categories } = await getCategories();

    const findBySlug = (list) => {
      for (const c of list) {
        if (c.slug === slug) return c;
        const child = findBySlug(c.children || []);
        if (child) return child;
      }
      return null;
    };

    return {
      success: true,
      category: findBySlug(categories),
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      category: null,
      error: error.message,
    };
  }
}
