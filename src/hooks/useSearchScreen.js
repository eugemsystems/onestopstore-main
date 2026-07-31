"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { searchProducts } from "@lib/actions/product.actions";
import { buildSearchUrl, mapUrlSortToSortBy } from "@utils/searchFilters";

/**
 * Server-driven search hook.
 * Initial page is SSR; load-more fetches next pages from the backend API.
 */
export default function useSearchScreen({
  initialProducts = [],
  totalDoc: initialTotalDoc = 0,
  page: initialPage = 1,
  hasMore: initialHasMore = false,
  searchQuery = "",
  selectedCategory = "",
  initialSort = "",
  initialRating = "",
  minPrice = "",
  maxPrice = "",
  limit = 24,
  basePath = "/search",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState(initialProducts);
  const [totalDoc, setTotalDoc] = useState(initialTotalDoc);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  const sortBy =
    mapUrlSortToSortBy(searchParams.get("sort") || initialSort) || "default";
  const minRating = searchParams.get("rating")
    ? Number(searchParams.get("rating"))
    : initialRating
      ? Number(initialRating)
      : null;

  useEffect(() => {
    setProducts(initialProducts);
    setTotalDoc(initialTotalDoc);
    setPage(initialPage);
    setHasMore(initialHasMore);
  }, [initialProducts, initialTotalDoc, initialPage, initialHasMore]);

  const pushSearch = useCallback(
    (updates) => {
      router.push(buildSearchUrl(searchParams, updates, basePath));
    },
    [router, searchParams, basePath],
  );

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await searchProducts({
        query: searchQuery,
        category: selectedCategory,
        sort: sortBy,
        rating: minRating || "",
        minPrice,
        maxPrice,
        page: nextPage,
        limit,
      });

      if (result.success) {
        setProducts((prev) => [...prev, ...(result.products || [])]);
        setPage(nextPage);
        setHasMore(result.hasMore ?? false);
        setTotalDoc(result.totalDoc ?? totalDoc);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  // `categorySlug` must be the category's REAL slug (e.g. "wine-25202"),
  // not something derived from its display name — Laravel's /product
  // category filter only matches the exact stored slug, and a name like
  // "Wine" does not simplify to that.
  const handleCategoryClick = (categoryId, categorySlug) => {
    pushSearch({
      _id: categoryId,
      category: categorySlug || null,
      page: null,
    });
  };

  const handleSortChange = (value) => {
    pushSearch({
      sort: value === "default" ? null : value,
      page: null,
    });
  };

  const handleRatingChange = (rating) => {
    pushSearch({
      rating: rating || null,
      page: null,
    });
  };

  const clearFilters = () => {
    router.push(basePath);
  };

  return {
    products,
    totalDoc,
    page,
    hasMore,
    loadingMore,
    loadMore,
    sortBy,
    minRating,
    pushSearch,
    handleCategoryClick,
    handleSortChange,
    handleRatingChange,
    clearFilters,
    searchParams,
    router,
  };
}
