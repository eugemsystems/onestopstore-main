/**
 * Map URL sort param to internal sort value.
 */
export function mapUrlSortToSortBy(urlSort) {
  if (!urlSort) return "default";
  if (urlSort === "best-selling") return "best-selling";
  return urlSort;
}

/**
 * Build listing URL preserving active filters.
 * @param {string} basePath - "/shop" or "/search"
 */
export function buildSearchUrl(currentParams, updates = {}, basePath = "/search") {
  const params = new URLSearchParams(
    typeof currentParams === "string"
      ? currentParams
      : currentParams?.toString?.() || "",
  );

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  });

  // Reset pagination when filters change unless page is explicitly set
  if (!Object.prototype.hasOwnProperty.call(updates, "page")) {
    params.delete("page");
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

/**
 * Normalize search params for API calls.
 */
export function normalizeSearchParams({
  query = "",
  category = "",
  sort = "",
  rating = "",
  minPrice = "",
  maxPrice = "",
  page = 1,
  limit = 24,
} = {}) {
  return {
    query: query || "",
    category: category || "",
    sort: sort && sort !== "default" ? sort : "",
    rating: rating || "",
    minPrice: minPrice || "",
    maxPrice: maxPrice || "",
    page: Number(page) || 1,
    limit: Number(limit) || 24,
  };
}
