"use server";

import { getHeaders } from "@lib/auth-server";
import {
  fetchAuctions,
  fetchAuctionDetail,
  fetchAuctionBids,
  fetchBidRequirements,
  placeBid,
  payAuctionDeposit,
  confirmAuctionDeposit,
  fetchMyBids,
  fetchMyWonAuctions,
} from "@services/LaravelAuctions";

export async function getAuctionsAction() {
  try {
    const auctions = await fetchAuctions();
    return { success: true, auctions, error: null };
  } catch (error) {
    return { success: false, auctions: [], error: error.message };
  }
}

export async function getAuctionByIdAction(id) {
  try {
    const headers = await getHeaders();
    const auction = await fetchAuctionDetail(id, headers);
    return { auction, error: null };
  } catch (error) {
    return { auction: null, error: error.message };
  }
}

export async function getAuctionBidsAction(id) {
  try {
    const data = await fetchAuctionBids(id);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

export async function getBidRequirementsAction(id) {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) return { data: null, error: "Unauthorized" };
    const data = await fetchBidRequirements(headers, id);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

export async function placeBidAction(id, amount) {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) return { data: null, error: "Please sign in to bid." };
    const data = await placeBid(headers, id, amount);
    if (!data?.current_bid) {
      return { data: null, error: data?.message || "Could not place bid." };
    }
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

export async function payAuctionDepositAction(id, paymentMethod, returnUrl, cancelUrl) {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) return { data: null, error: "Please sign in first." };
    const data = await payAuctionDeposit(headers, id, { paymentMethod, returnUrl, cancelUrl });
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

export async function getMyBidsAction() {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) return { bids: [], error: "Unauthorized" };
    const data = await fetchMyBids(headers);
    return { bids: Array.isArray(data?.data) ? data.data : [], error: null };
  } catch (error) {
    return { bids: [], error: error.message };
  }
}

export async function getMyWinsAction() {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) {
      return { wins: [], isBanned: false, banReason: null, error: "Unauthorized" };
    }
    const data = await fetchMyWonAuctions(headers);
    const wins = Array.isArray(data) ? data : data?.data || [];
    return {
      wins,
      isBanned: data?.is_banned === true,
      banReason: data?.ban_reason ?? null,
      error: null,
    };
  } catch (error) {
    return { wins: [], isBanned: false, banReason: null, error: error.message };
  }
}

export async function confirmAuctionDepositAction(id) {
  try {
    const headers = await getHeaders();
    if (!headers.authorization) return { data: null, error: "Unauthorized" };
    const data = await confirmAuctionDeposit(headers, id);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}
