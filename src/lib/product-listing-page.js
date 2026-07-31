import { searchProducts } from "@lib/actions/product.actions";
import { getAttributes } from "@lib/actions/attribute.actions";
import { getCategories } from "@lib/actions/category.actions";
import { getGlobalSettings } from "@lib/actions/settings.actions";
import { resolveStoreLayout } from "@lib/resolveStoreLayout";

export async function getProductListingData(searchParams) {
  const {
    _id: categoryId, // numeric id, UI-highlight only — NOT a valid API filter value
    category: categorySlug, // real slug (e.g. "wine-25202") — this is what Laravel needs
    query,
    sort,
    rating,
    page,
    minPrice,
    maxPrice,
    on_sale: onSale,
  } = await searchParams;

  const currentPage = Number(page) || 1;

  const [
    { products, totalDoc, hasMore, page: resultPage, error: productsError },
    { attributes, error: attributesError },
    { categories, error: categoriesError },
    { globalSetting, error: settingsError },
  ] = await Promise.all([
    searchProducts({
      category: categorySlug || "",
      query: query || "",
      sort: sort || "",
      rating: rating || "",
      minPrice: minPrice || "",
      maxPrice: maxPrice || "",
      onSale: onSale === "1",
      page: currentPage,
      limit: 24,
    }),
    getAttributes(),
    getCategories(),
    getGlobalSettings(),
  ]);

  const storeLayout = await resolveStoreLayout(globalSetting, null, {
    allowQuery: false,
  });

  return {
    products: products || [],
    attributes: attributes || [],
    categories: categories || [],
    searchQuery: query || "",
    // Kept as the numeric id so SearchScreenNew's `selectedCategory === cat._id`
    // pill-highlight check still works.
    selectedCategory: categoryId || "",
    initialSort: sort || "",
    initialRating: rating || "",
    minPrice: minPrice || "",
    maxPrice: maxPrice || "",
    onSale: onSale === "1",
    totalDoc: totalDoc || 0,
    page: resultPage || currentPage,
    hasMore: hasMore ?? false,
    error:
      productsError || attributesError || categoriesError || settingsError,
    storeLayout,
  };
}
