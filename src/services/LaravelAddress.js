import { baseURL, handleResponse, resilientFetch } from "@services/CommonService";
import { unwrapList } from "@services/laravelAdapter";

/**
 * Laravel address-book bridge.
 * Laravel contract (verified live): GET/POST /address, GET/PUT/DELETE /address/{id}.
 * Fields: {title, street, city, country_id, state_id, phone, country_code, pincode}.
 * Used directly in this shape by checkout's billing/shipping selectors and
 * the My Addresses page — no free-text translation layer.
 */

const jsonHeaders = (headers) => ({
  ...headers,
  Accept: "application/json",
  "Accept-Language": "en",
  "Content-Type": "application/json",
});

export async function listRawAddresses(headers) {
  const res = await resilientFetch(`${baseURL}/address`, {
    headers: jsonHeaders(headers),
    cache: "no-store",
  });
  const payload = await handleResponse(res);
  return unwrapList(payload);
}

export async function createRawAddress(headers, payload) {
  const res = await resilientFetch(`${baseURL}/address`, {
    method: "POST",
    headers: jsonHeaders(headers),
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  const row = await handleResponse(res);
  if (!row?.id) throw new Error(row?.message || "Could not save address");
  return row;
}

export async function updateRawAddress(headers, id, payload) {
  const res = await resilientFetch(`${baseURL}/address/${id}`, {
    method: "PUT",
    headers: jsonHeaders(headers),
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  const row = await handleResponse(res);
  if (!row?.id) throw new Error(row?.message || "Could not update address");
  return row;
}

export async function deleteAddress(headers, id) {
  const res = await resilientFetch(`${baseURL}/address/${id}`, {
    method: "DELETE",
    headers: jsonHeaders(headers),
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function listCountries(headers) {
  const res = await resilientFetch(`${baseURL}/country?paginate=300`, {
    headers: jsonHeaders(headers),
    next: { revalidate: 3600 },
  });
  const payload = await handleResponse(res);
  return unwrapList(payload);
}
