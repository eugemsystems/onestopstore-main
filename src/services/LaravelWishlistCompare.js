"use client";

/**
 * Client-side wishlist/compare bridge — Raines Laravel `/wishlist` and
 * `/compare`. These run in the BROWSER (not server actions) so a click
 * gets instant feedback, mirroring the legacy frontend's AddToWishlist.jsx
 * / AddToCompareNew.jsx behaviour: requires a signed-in session, otherwise
 * routes the user to /login.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const jsonHeaders = (token) => ({
  Accept: "application/json",
  "Accept-Language": "en",
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export async function fetchWishlistIds(token) {
  if (!token) return [];
  const res = await fetch(`${API_BASE}/wishlist?paginate=200`, {
    headers: jsonHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) return [];
  const payload = await res.json();
  const rows = payload?.data || payload || [];
  return rows.map((p) => p.id);
}

export async function fetchCompareIds(token) {
  if (!token) return [];
  const res = await fetch(`${API_BASE}/compare?paginate=200`, {
    headers: jsonHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) return [];
  const payload = await res.json();
  const rows = payload?.data || payload || [];
  return rows.map((p) => p.id);
}

export async function removeFromCompare(token, productId) {
  const res = await fetch(`${API_BASE}/compare/${productId}`, {
    method: "DELETE",
    headers: jsonHeaders(token),
  });
  return res.ok;
}

export async function addToWishlist(token, productId) {
  const res = await fetch(`${API_BASE}/wishlist`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ product_id: productId }),
  });
  return res.ok;
}

export async function removeFromWishlist(token, productId) {
  const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
    method: "DELETE",
    headers: jsonHeaders(token),
  });
  return res.ok;
}

export async function addToCompare(token, productId) {
  const res = await fetch(`${API_BASE}/compare`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ product_id: productId }),
  });
  return res.ok;
}
