import { baseURL, handleResponse, resilientFetch } from "@services/CommonService";

/**
 * Points / Wallet / Layby / Vouchers / Tickets / Refunds — Laravel bridges.
 * These mirror the legacy account pages (Points, Wallet, Layby, GiftCards,
 * Tickets, Refund) 1:1 against the real endpoints. Points/Wallet return a
 * clean "feature disabled" message when Settings > Activation has them
 * turned off — that's surfaced as-is rather than hidden, matching how the
 * legacy app behaves.
 */

const jsonHeaders = (headers) => ({
  ...headers,
  Accept: "application/json",
  "Accept-Language": "en",
  "Content-Type": "application/json",
});

export async function getPointsConsumer(headers, { page = 1, paginate = 10 } = {}) {
  const res = await resilientFetch(
    `${baseURL}/points/consumer?page=${page}&paginate=${paginate}`,
    { headers: jsonHeaders(headers), cache: "no-store" },
  );
  return handleResponse(res);
}

export async function getWalletConsumerSelf(headers, { page = 1, paginate = 10 } = {}) {
  const res = await resilientFetch(
    `${baseURL}/wallet/consumer/self?page=${page}&paginate=${paginate}`,
    { headers: jsonHeaders(headers), cache: "no-store" },
  );
  return handleResponse(res);
}

export async function requestWalletRefundAll(headers) {
  const res = await resilientFetch(`${baseURL}/wallet/refund-all`, {
    method: "POST",
    headers: jsonHeaders(headers),
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function listLaybys(headers, { page = 1, paginate = 10 } = {}) {
  const res = await resilientFetch(
    `${baseURL}/layby/my-applications?page=${page}&paginate=${paginate}`,
    { headers: jsonHeaders(headers), cache: "no-store" },
  );
  return handleResponse(res);
}

export async function getLaybyById(headers, id) {
  const res = await resilientFetch(`${baseURL}/layby/applications/${id}`, {
    headers: jsonHeaders(headers),
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function payLaybyInstallment(headers, id, { amount, paymentMethod, currency }) {
  const res = await resilientFetch(`${baseURL}/layby/applications/${id}/payment`, {
    method: "POST",
    headers: jsonHeaders(headers),
    cache: "no-store",
    body: JSON.stringify({ amount, payment_method: paymentMethod, currency }),
  });
  return handleResponse(res);
}

export async function listVouchers(headers) {
  const res = await resilientFetch(`${baseURL}/vouchers/my-vouchers`, {
    headers: jsonHeaders(headers),
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function redeemVoucher(headers, code) {
  const res = await resilientFetch(`${baseURL}/vouchers/redeem`, {
    method: "POST",
    headers: jsonHeaders(headers),
    cache: "no-store",
    body: JSON.stringify({ code }),
  });
  return handleResponse(res);
}

export async function listTickets(headers, { page = 1, paginate = 10 } = {}) {
  const res = await resilientFetch(
    `${baseURL}/tickets?page=${page}&paginate=${paginate}`,
    { headers: jsonHeaders(headers), cache: "no-store" },
  );
  return handleResponse(res);
}

export async function getTicketById(headers, id) {
  const res = await resilientFetch(`${baseURL}/tickets/${id}`, {
    headers: jsonHeaders(headers),
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function createTicket(headers, payload) {
  const res = await resilientFetch(`${baseURL}/tickets`, {
    method: "POST",
    headers: jsonHeaders(headers),
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function addTicketMessage(headers, id, message) {
  const res = await resilientFetch(`${baseURL}/tickets/${id}/messages`, {
    method: "POST",
    headers: jsonHeaders(headers),
    cache: "no-store",
    body: JSON.stringify({ message }),
  });
  return handleResponse(res);
}

export async function closeTicket(headers, id) {
  const res = await resilientFetch(`${baseURL}/tickets/${id}/close`, {
    method: "POST",
    headers: jsonHeaders(headers),
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function reopenTicket(headers, id) {
  const res = await resilientFetch(`${baseURL}/tickets/${id}/reopen`, {
    method: "POST",
    headers: jsonHeaders(headers),
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function listRefunds(headers, { page = 1, paginate = 10 } = {}) {
  const res = await resilientFetch(
    `${baseURL}/refund?page=${page}&paginate=${paginate}`,
    { headers: jsonHeaders(headers), cache: "no-store" },
  );
  return handleResponse(res);
}

/**
 * Product return requests — matches the legacy frontend's ReturnModal /
 * ReturnsAPI ('/returns') exactly: GET to check which items already have a
 * pending/submitted request, POST to file a new one.
 */
export async function listReturnsForOrder(headers, orderId) {
  const res = await resilientFetch(`${baseURL}/returns?order_id=${orderId}`, {
    headers: jsonHeaders(headers),
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function submitReturnRequest(headers, payload) {
  const res = await resilientFetch(`${baseURL}/returns`, {
    method: "POST",
    headers: jsonHeaders(headers),
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}
