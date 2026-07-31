import { baseURL, handleResponse, resilientFetch } from "@services/CommonService";
import { toTemplateCategory, unwrapList } from "@services/laravelAdapter";

/**
 * Get showing categories — Raines Laravel `/category?type=product`.
 * The UI (FeatureCategory, category drawers) expects a single root whose
 * `children` are the visible top-level categories, so we wrap the Laravel
 * list in one synthetic root node.
 */
const getShowingCategory = async () => {
  try {
    const response = await resilientFetch(
      `${baseURL}/category?type=product&status=1`,
      {
        next: { revalidate: 120 }, // revalidate every 2 minutes
      },
    );

    const payload = await handleResponse(response);
    const children = unwrapList(payload)
      .map(toTemplateCategory)
      .filter(Boolean);

    const categories = [
      {
        _id: "root",
        name: { en: "Home" },
        slug: "root",
        children,
      },
    ];

    return { categories, error: null, loading: false };
  } catch (error) {
    return { categories: [], error: error.message, loading: false };
  }
};

export { getShowingCategory };
