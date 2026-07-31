import { baseURL, handleResponse, resilientFetch } from "@services/CommonService";

/**
 * Fetch all published product sliders with their products.
 * Used server-side on the home page.
 */
const getPublishedProductSliders = async () => {
  try {
    const response = await resilientFetch(`${baseURL}/product-slider/show`, {
      next: {
        revalidate: 60,
        tags: ["product_sliders"],
      },
    });
    const sliders = await handleResponse(response);
    return { sliders, error: null };
  } catch (error) {
    return { sliders: [], error: error.message };
  }
};

export { getPublishedProductSliders };
