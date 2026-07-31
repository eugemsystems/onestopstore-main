import { RAINES_CUSTOMIZATION, RAINES_GLOBAL } from "@services/rainesDefaults";

/**
 * Settings services — Raines edition.
 * The Laravel backend has no KachaBazar settings endpoints, so these
 * resolve instantly from local defaults (see services/rainesDefaults.js).
 * When a Laravel settings mapping is added later, swap the implementations
 * here without touching any consuming component.
 */

const getStoreCustomizationSetting = async () => {
  return { storeCustomizationSetting: RAINES_CUSTOMIZATION };
};

const getGlobalSetting = async () => {
  return { globalSetting: RAINES_GLOBAL };
};

const getShowingLanguage = async () => {
  return {
    languages: [
      { _id: "en", name: "English", iso_code: "en", flag: "GB", status: "show" },
    ],
  };
};

const getStoreSetting = async () => {
  return { storeSetting: null };
};

const getStoreSecretKeys = async () => {
  return { storeSetting: null };
};

const getStoreSeoSetting = async () => {
  return { seoSetting: null };
};

export {
  getGlobalSetting,
  getShowingLanguage,
  getStoreSetting,
  getStoreSeoSetting,
  getStoreSecretKeys,
  getStoreCustomizationSetting,
};
