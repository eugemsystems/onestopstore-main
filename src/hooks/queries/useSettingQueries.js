"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCustomizationSettings,
  getGlobalSettings,
  getStoreSettings,
  getLanguages,
} from "@lib/actions/settings.actions";

// Query keys factory
export const settingKeys = {
  all: ["settings"],
  customization: () => [...settingKeys.all, "customization"],
  global: () => [...settingKeys.all, "global"],
  store: () => [...settingKeys.all, "store"],
  languages: () => [...settingKeys.all, "languages"],
};

/**
 * Hook to fetch store customization settings
 */
export function useCustomizationSettings(options = {}) {
  return useQuery({
    queryKey: settingKeys.customization(),
    queryFn: async () => {
      const result = await getCustomizationSettings();
      if (!result.success) {
        throw new Error(
          result.error || "Failed to fetch customization settings"
        );
      }
      return result.storeCustomizationSetting;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - settings don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
}

/**
 * Hook to fetch global settings (currency, etc.)
 */
export function useGlobalSettings(options = {}) {
  return useQuery({
    queryKey: settingKeys.global(),
    queryFn: async () => {
      const result = await getGlobalSettings();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch global settings");
      }
      return result.globalSetting;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
}

/**
 * Hook to fetch store settings
 */
export function useStoreSettings(options = {}) {
  return useQuery({
    queryKey: settingKeys.store(),
    queryFn: async () => {
      const result = await getStoreSettings();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch store settings");
      }
      return result.storeSetting;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
}

/**
 * Hook to fetch available languages
 */
export function useLanguages(options = {}) {
  return useQuery({
    queryKey: settingKeys.languages(),
    queryFn: async () => {
      const result = await getLanguages();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch languages");
      }
      return result.languages;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - languages rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
}
