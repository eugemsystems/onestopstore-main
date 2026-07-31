"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductReviews,
  addReview,
  getCustomerReviews,
} from "@lib/actions/review.actions";

// Query keys factory
export const reviewKeys = {
  all: ["reviews"],
  lists: () => [...reviewKeys.all, "list"],
  byProduct: (productId) => [...reviewKeys.lists(), "product", productId],
  customer: () => [...reviewKeys.all, "customer"],
};

/**
 * Hook to fetch reviews for a product
 */
export function useProductReviews(productId, options = {}) {
  return useQuery({
    queryKey: reviewKeys.byProduct(productId),
    queryFn: async () => {
      const result = await getProductReviews(productId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch reviews");
      }
      return result.reviews;
    },
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to fetch customer's own reviews
 */
export function useCustomerReviews(options = {}) {
  return useQuery({
    queryKey: reviewKeys.customer(),
    queryFn: async () => {
      const result = await getCustomerReviews();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch reviews");
      }
      return result.reviews;
    },
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Hook to create a new review
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData) => {
      const result = await addReview(reviewData);
      if (!result.success) {
        throw new Error(result.error || "Failed to submit review");
      }
      return result.review;
    },
    onSuccess: (data, variables) => {
      // Invalidate product reviews to refetch
      queryClient.invalidateQueries({
        queryKey: reviewKeys.byProduct(variables.productId),
      });
      // Also invalidate customer reviews
      queryClient.invalidateQueries({
        queryKey: reviewKeys.customer(),
      });
    },
  });
}

/**
 * Hook to invalidate review queries
 */
export function useInvalidateReviews() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: reviewKeys.all }),
    invalidateByProduct: (productId) =>
      queryClient.invalidateQueries({
        queryKey: reviewKeys.byProduct(productId),
      }),
    invalidateCustomer: () =>
      queryClient.invalidateQueries({ queryKey: reviewKeys.customer() }),
  };
}
