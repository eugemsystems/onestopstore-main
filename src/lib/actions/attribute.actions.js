"use server";

/**
 * Get showing attributes
 * (Raines: variant attributes come embedded per-product from the Laravel
 * API; there is no global attributes endpoint, so return empty without a
 * network round-trip.)
 */
export async function getAttributes() {
  return {
    success: true,
    attributes: [],
    error: null,
  };
}
