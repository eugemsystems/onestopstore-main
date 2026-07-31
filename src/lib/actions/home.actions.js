"use server";

import { baseURL, handleResponse, resilientFetch } from "@services/CommonService";

/**
 * Get an admin-configured "home page" content block (`/home?slug=...`).
 * Without a slug, the API returns whichever homepage is currently active
 * (`Helpers::getActiveTheme()`), cached server-side for 10 minutes.
 *
 * `content.products_ids` is aggregated server-side (onestopstore-api) from
 * every product picker across the admin "Home Pages" builder — it's not
 * something this frontend authors, only reads.
 */
export async function getHomePageContent(slug = "") {
  try {
    const query = slug ? `?slug=${encodeURIComponent(slug)}` : "";
    const response = await resilientFetch(`${baseURL}/home${query}`, {
      next: { revalidate: 120, tags: ["home_page_content"] },
    });
    const homePage = await handleResponse(response);

    return {
      success: true,
      content: homePage?.content || null,
      slug: homePage?.slug || null,
      error: null,
    };
  } catch (error) {
    return { success: false, content: null, slug: null, error: error.message };
  }
}
