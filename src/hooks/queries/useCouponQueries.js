"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { validateCoupon, getCouponByCode } from "@lib/actions/coupon.actions";

// Query keys factory
export const couponKeys = {
  all: ["coupons"],
  validation: (code) => [...couponKeys.all, "validation", code],
  detail: (code) => [...couponKeys.all, "detail", code],
};

/**
 * Hook to validate a coupon
 */
export function useValidateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, cartTotal }) => {
      const result = await validateCoupon(code, cartTotal);
      if (!result.success) {
        throw new Error(result.error || "Invalid coupon");
      }
      return result.coupon;
    },
    onSuccess: (data, variables) => {
      // Cache the validated coupon
      queryClient.setQueryData(couponKeys.validation(variables.code), data);
    },
  });
}

/**
 * Hook to fetch coupon by code
 */
export function useCoupon(code, options = {}) {
  return useQuery({
    queryKey: couponKeys.detail(code),
    queryFn: async () => {
      const result = await getCouponByCode(code);
      if (!result.success) {
        throw new Error(result.error || "Coupon not found");
      }
      return result.coupon;
    },
    enabled: !!code,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
