"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCategories,
  getCategoryBySlug,
} from "@lib/actions/category.actions";

// Query keys factory
export const categoryKeys = {
  all: ["categories"],
  lists: () => [...categoryKeys.all, "list"],
  list: (filters) => [...categoryKeys.lists(), filters],
  details: () => [...categoryKeys.all, "detail"],
  detail: (slug) => [...categoryKeys.details(), slug],
};

/**
 * Hook to fetch all showing categories
 */
export function useCategories(options = {}) {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const result = await getCategories();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch categories");
      }
      return result.categories;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
}

/**
 * Hook to fetch a single category by slug
 */
export function useCategory(slug, options = {}) {
  return useQuery({
    queryKey: categoryKeys.detail(slug),
    queryFn: async () => {
      const result = await getCategoryBySlug(slug);
      if (!result.success) {
        throw new Error(result.error || "Category not found");
      }
      return result.category;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}
