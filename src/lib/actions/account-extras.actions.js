"use server";

import { getHeaders } from "@lib/auth-server";
import {
  getPointsConsumer,
  getWalletConsumerSelf,
  requestWalletRefundAll,
  listLaybys,
  getLaybyById,
  payLaybyInstallment,
  listVouchers,
  redeemVoucher,
  listTickets,
  getTicketById,
  createTicket,
  addTicketMessage,
  closeTicket,
  reopenTicket,
  listRefunds,
  listReturnsForOrder,
  submitReturnRequest,
} from "@services/LaravelAccountExtras";

const guarded = async (fn) => {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) return { data: null, error: "Unauthorized" };
    const data = await fn(headers);
    if (data?.success === false) return { data: null, error: data.message };
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Next.js Server Actions require every export from a "use server" file to be
// declared `async` directly — a plain arrow function that merely returns a
// promise (even from an async helper) fails the build ("Server Actions must
// be async functions").

export async function getPointsAction(page = 1) {
  return guarded((headers) => getPointsConsumer(headers, { page }));
}

export async function getWalletAction(page = 1) {
  return guarded((headers) => getWalletConsumerSelf(headers, { page }));
}

export async function requestWalletRefundAction() {
  return guarded((headers) => requestWalletRefundAll(headers));
}

export async function getLaybysAction(page = 1) {
  return guarded((headers) => listLaybys(headers, { page }));
}

export async function getLaybyAction(id) {
  return guarded((headers) => getLaybyById(headers, id));
}

export async function payLaybyAction(id, amount, paymentMethod, currency = "USD") {
  return guarded((headers) =>
    payLaybyInstallment(headers, id, { amount, paymentMethod, currency }),
  );
}

export async function getVouchersAction() {
  return guarded((headers) => listVouchers(headers));
}

export async function redeemVoucherAction(code) {
  return guarded((headers) => redeemVoucher(headers, code));
}

export async function getTicketsAction(page = 1) {
  return guarded((headers) => listTickets(headers, { page }));
}

export async function getTicketAction(id) {
  return guarded((headers) => getTicketById(headers, id));
}

export async function createTicketAction(payload) {
  return guarded((headers) => createTicket(headers, payload));
}

export async function addTicketMessageAction(id, message) {
  return guarded((headers) => addTicketMessage(headers, id, message));
}

export async function closeTicketAction(id) {
  return guarded((headers) => closeTicket(headers, id));
}

export async function reopenTicketAction(id) {
  return guarded((headers) => reopenTicket(headers, id));
}

export async function getRefundsAction(page = 1) {
  return guarded((headers) => listRefunds(headers, { page }));
}

export async function listReturnsForOrderAction(orderId) {
  return guarded((headers) => listReturnsForOrder(headers, orderId));
}

export async function submitReturnRequestAction(payload) {
  return guarded((headers) => submitReturnRequest(headers, payload));
}
