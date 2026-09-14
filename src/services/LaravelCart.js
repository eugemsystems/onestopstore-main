"use client";

/**
 * Client-side bridge to Raines Laravel's `/cart` API for logged-in users.
 * Runs in the browser (not server actions) so cart mutations sync in the
 * background without blocking the UI — localStorage (via react-use-cart)
 * stays the source of truth for rendering.
 *
 * IMPORTANT: `POST /cart` (store) and `PUT /cart` (update) both go through
 * CartRepository::verifyCartItem(), which ADDS the given quantity onto
 * whatever is already stored server-side for that product/variation rather
 * than setting it absolutely — fine for a one-off "add N more", wrong for
 * "set this line to exactly N" (would double-count on every sync). Only
 * `PUT /replace/cart` (keyed by the row's own `id`) sets quantity
 * absolutely, so every quantity CHANGE to an already-synced line goes
 * through replace, never store/update.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const jsonHeaders = (token) => ({
  Accept: "application/json",
  "Accept-Language": "en",
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

/** GET /cart -> [{ id, product_id, variation_id, quantity, product }] */
export async function fetchServerCart(token) {
  if (!token) return [];
  try {
    const res = await fetch(`${API_BASE}/cart?paginate=200`, {
      headers: jsonHeaders(token),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const payload = await res.json();
    const rows = payload?.items || payload?.data?.items || [];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

/** POST /cart — creates a new line, or ADDS quantity to an existing one. Returns the created/updated row, or null. */
export async function createServerCartItem(token, { product_id, variation_id, quantity }) {
  try {
    const res = await fetch(`${API_BASE}/cart`, {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify({ product_id, variation_id: variation_id ?? null, quantity }),
    });
    if (!res.ok) return null;
    const payload = await res.json();
    return payload?.items?.[0] || null;
  } catch {
    return null;
  }
}

/** PUT /replace/cart — sets an existing line's quantity absolutely (does NOT add). */
export async function replaceServerCartItem(token, { id, product_id, variation_id, quantity }) {
  try {
    const res = await fetch(`${API_BASE}/replace/cart`, {
      method: "PUT",
      headers: jsonHeaders(token),
      body: JSON.stringify({ id, product_id, variation_id: variation_id ?? null, quantity }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** DELETE /cart/{id} */
export async function deleteServerCartItem(token, id) {
  if (!id) return false;
  try {
    const res = await fetch(`${API_BASE}/cart/${id}`, {
      method: "DELETE",
      headers: jsonHeaders(token),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** POST /clear/cart */
export async function clearServerCart(token) {
  try {
    const res = await fetch(`${API_BASE}/clear/cart`, {
      method: "POST",
      headers: jsonHeaders(token),
    });
    return res.ok;
  } catch {
    return false;
  }
}
