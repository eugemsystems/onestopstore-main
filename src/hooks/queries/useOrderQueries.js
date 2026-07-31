"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrders,
  getOrderById,
  createOrder,
} from "@lib/actions/order.actions";

// Query keys factory
export const orderKeys = {
  all: ["orders"],
  lists: () => [...orderKeys.all, "list"],
  list: (userId) => [...orderKeys.lists(), userId],
  details: () => [...orderKeys.all, "detail"],
  detail: (id) => [...orderKeys.details(), id],
};

/**
 * Hook to fetch user orders
 */
export function useOrders(userId, options = {}) {
  return useQuery({
    queryKey: orderKeys.list(userId),
    queryFn: async () => {
      const result = await getOrders(userId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch orders");
      }
      return result.orders;
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds - orders change frequently
    ...options,
  });
}

/**
 * Hook to fetch a single order by ID
 */
export function useOrder(orderId, options = {}) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: async () => {
      const result = await getOrderById(orderId);
      if (!result.success) {
        throw new Error(result.error || "Order not found");
      }
      return result.order;
    },
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Hook to create a new order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData) => {
      const result = await createOrder(orderData);
      if (!result.success) {
        throw new Error(result.error || "Failed to create order");
      }
      return result.order;
    },
    onSuccess: (data) => {
      // Invalidate orders list to refetch
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

/**
 * Hook to invalidate order queries
 */
export function useInvalidateOrders() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: orderKeys.all }),
    invalidateList: (userId) =>
      queryClient.invalidateQueries({ queryKey: orderKeys.list(userId) }),
    invalidateOrder: (id) =>
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) }),
  };
}
