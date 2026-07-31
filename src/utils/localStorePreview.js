/**
 * Local/dev preview overrides (layout & theme cookies) are only allowed in
 * development. Production always uses admin global settings / default theme.
 */
export const isLocalStorePreview = process.env.NODE_ENV === "development";

export const STORE_LAYOUT_COOKIE = "_store_layout";
export const STORE_THEME_COOKIE = "_theme";
