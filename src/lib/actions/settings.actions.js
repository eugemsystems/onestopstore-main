"use server";

import { revalidateTag } from "next/cache";
import {
  baseURL,
  handleResponse,
  resilientFetch,
} from "@services/CommonService";

import { RAINES_CUSTOMIZATION, RAINES_GLOBAL } from "@services/rainesDefaults";

/**
 * Get store customization settings
 * (Raines: served from local defaults — no Laravel equivalent endpoint)
 */
export async function getCustomizationSettings() {
  return {
    success: true,
    storeCustomizationSetting: RAINES_CUSTOMIZATION,
    error: null,
  };
}

/**
 * Laravel `/themeOptions` — the real, admin-editable source of truth for
 * support contact info, footer addresses/links, and copyright text (matches
 * the legacy frontend's ThemeOptionProvider, same endpoint/shape).
 */
export async function getThemeOptions() {
  try {
    const response = await resilientFetch(`${baseURL}/themeOptions`, {
      headers: { Accept: "application/json", "Accept-Language": "en" },
      next: { revalidate: 300, tags: ["theme-options"] },
    });
    const payload = await handleResponse(response);
    return { success: true, themeOptions: payload?.options || {}, error: null };
  } catch (error) {
    return { success: false, themeOptions: {}, error: error.message };
  }
}

/**
 * Merge live /themeOptions fields (support number/email, addresses, footer
 * links, copyright) into the local defaults — every consumer of
 * globalSetting (TopNavbar, ProductModal, Footer, ...) picks these up
 * without needing its own fetch.
 */
async function buildGlobalSetting() {
  const { themeOptions } = await getThemeOptions();
  const footer = themeOptions?.footer || {};
  const header = themeOptions?.header || {};

  return {
    ...RAINES_GLOBAL,
    contact: header.support_number || footer.support_number || RAINES_GLOBAL.contact,
    email: footer.support_email || RAINES_GLOBAL.email,
    address: footer.about_address || RAINES_GLOBAL.address,
    copyright_text: footer.footer_copyright
      ? footer.copyright_content || RAINES_GLOBAL.copyright_text
      : RAINES_GLOBAL.copyright_text,
    footer_about: footer.footer_about || "",
    footer_addresses: Array.isArray(footer.addresses) ? footer.addresses : [],
    footer_help_center: Array.isArray(footer.help_center) ? footer.help_center : [],
    footer_social: {
      enabled: !!footer.social_media_enable,
      facebook: footer.facebook || "",
      twitter: footer.twitter || "",
      instagram: footer.instagram || "",
      pinterest: footer.pinterest || "",
    },
  };
}

/**
 * Get global settings (currency, etc.)
 * (Raines: local defaults, overlaid with live /themeOptions contact/footer data)
 */
export async function getGlobalSettings() {
  return {
    success: true,
    globalSetting: await buildGlobalSetting(),
    error: null,
  };
}

/**
 * Get global settings — NEVER cached.
 * Used for security-critical checks like guest checkout gate on the checkout page.
 */
export async function getGlobalSettingsFresh() {
  return {
    success: true,
    globalSetting: await buildGlobalSetting(),
    error: null,
  };
}


/**
 * Get store settings — Raines Laravel `/settings`.
 * Maps the Laravel settings shape (values.payment_methods etc.) into the
 * flags the checkout UI reads (cod_status, stripe_status, payment_methods).
 */
export async function getStoreSettings() {
  try {
    const response = await resilientFetch(`${baseURL}/settings`, {
      headers: { Accept: "application/json", "Accept-Language": "en" },
      next: { revalidate: 300, tags: ["settings"] },
    });

    const payload = await handleResponse(response);
    const values = payload?.values || payload || {};

    // Only expose gateways the admin has enabled
    const enabledMethods = (values.payment_methods || []).filter(
      (m) => m?.status === true,
    );

    const storeSetting = {
      cod_status: enabledMethods.some((m) => m.name === "cod"),
      stripe_status: enabledMethods.some((m) => m.name === "stripe"),
      payment_methods: enabledMethods.map((m) => ({
        name: m.name,
        title: m.title || m.name,
        accounts: m.accounts || null,
      })),
      delivery: values.delivery || null,
      wallet_points: values.wallet_points || null,
      general: values.general || null,
      // Login only shows the reCAPTCHA widget when the admin has it enabled
      // — the widget itself, not enforcement (matches the legacy frontend,
      // which never validated the token client-side either).
      google_recaptcha: {
        status: !!values.google_reCaptcha?.status,
        site_key: values.google_reCaptcha?.site_key || "",
      },
    };

    return {
      success: true,
      storeSetting,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      storeSetting: null,
      error: error.message,
    };
  }
}

/**
 * Get showing languages
 */
export async function getLanguages() {
  try {
    const response = await resilientFetch(`${baseURL}/language/show`, {
      next: { revalidate: 120 },
    });
    const languages = await handleResponse(response);
    return {
      success: true,
      languages,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      languages: [],
      error: error.message,
    };
  }
}

/**
 * Get store SEO settings
 */
export async function getSeoSettings() {
  try {
    const response = await resilientFetch(
      `${baseURL}/setting/store-setting/seo`,
      {
        next: { revalidate: 300, tags: ["settings"] },
      },
    );

    const seoSetting = await handleResponse(response);

    return {
      success: true,
      seoSetting,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      seoSetting: null,
      error: error.message,
    };
  }
}

/**
 * Revalidate settings cache
 */
export async function revalidateSettings() {
  revalidateTag("settings");
}
