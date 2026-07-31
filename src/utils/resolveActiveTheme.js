import Cookies from "js-cookie";
import {
  isLocalStorePreview,
  STORE_LAYOUT_COOKIE,
  STORE_THEME_COOKIE,
} from "@utils/localStorePreview";

/** Remove stale local preview cookies in production. */
export function clearLocalPreviewCookies() {
  if (isLocalStorePreview) return;
  Cookies.remove(STORE_LAYOUT_COOKIE, { path: "/" });
  Cookies.remove(STORE_THEME_COOKIE, { path: "/" });
}

/**
 * Resolve active theme on the client.
 * Production always uses the API default theme; local/dev may use cookie override.
 */
export function resolveActiveTheme(themes, defaultTheme) {
  clearLocalPreviewCookies();

  if (isLocalStorePreview) {
    const savedId = Cookies.get(STORE_THEME_COOKIE);
    if (savedId && themes?.length) {
      const found = themes.find((t) => t._id === savedId);
      if (found) return found;
    }
  }

  return defaultTheme || null;
}
