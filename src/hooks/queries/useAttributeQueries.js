"use client";

import { useQuery } from "@tanstack/react-query";
import { getAttributes } from "@lib/actions/attribute.actions";

// Query keys factory
export const attributeKeys = {
  all: ["attributes"],
  lists: () => [...attributeKeys.all, "list"],
};

/**
 * Hook to fetch all showing attributes
 */
export function useAttributes(options = {}) {
  return useQuery({
    queryKey: attributeKeys.lists(),
    queryFn: async () => {
      const result = await getAttributes();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch attributes");
      }
      return result.attributes;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - attributes don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
}
