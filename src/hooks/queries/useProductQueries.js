"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStoreProducts,
  getProductBySlug,
  searchProducts,
  getDiscountedProducts,
  getPopularProducts,
  getRelatedProducts,
} from "@lib/actions/product.actions";

// Query keys factory
export const productKeys = {
  all: ["products"],
  lists: () => [...productKeys.all, "list"],
  list: (filters) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all, "detail"],
  detail: (slug) => [...productKeys.details(), slug],
  search: (params) => [...productKeys.all, "search", params],
  discounted: () => [...productKeys.all, "discounted"],
  popular: () => [...productKeys.all, "popular"],
  related: (category) => [...productKeys.all, "related", category],
};

/**
 * Hook to fetch store products with filtering
 */
export function useProducts(filters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: async () => {
      const result = await getStoreProducts(filters);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch products");
      }
      return result;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch a single product by slug
 */
export function useProduct(slug, options = {}) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: async () => {
      const result = await getProductBySlug(slug);
      if (!result.success) {
        throw new Error(result.error || "Product not found");
      }
      return result.product;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to search products
 */
export function useSearchProducts(searchParams, options = {}) {
  return useQuery({
    queryKey: productKeys.search(searchParams),
    queryFn: async () => {
      const result = await searchProducts(searchParams);
      if (!result.success) {
        throw new Error(result.error || "Search failed");
      }
      return result;
    },
    enabled: options.enabled !== false,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Hook to fetch discounted products
 */
export function useDiscountedProducts(options = {}) {
  return useQuery({
    queryKey: productKeys.discounted(),
    queryFn: async () => {
      const result = await getDiscountedProducts();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch discounted products");
      }
      return result.products;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to fetch popular products
 */
export function usePopularProducts(options = {}) {
  return useQuery({
    queryKey: productKeys.popular(),
    queryFn: async () => {
      const result = await getPopularProducts();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch popular products");
      }
      return result.products;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to fetch related products by category
 */
export function useRelatedProducts(category, options = {}) {
  return useQuery({
    queryKey: productKeys.related(category),
    queryFn: async () => {
      const result = await getRelatedProducts(category);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch related products");
      }
      return result.products;
    },
    enabled: !!category,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to invalidate product queries
 */
export function useInvalidateProducts() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
    invalidateList: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
    invalidateProduct: (slug) =>
      queryClient.invalidateQueries({ queryKey: productKeys.detail(slug) }),
  };
}
