import { baseURL, handleResponse, resilientFetch } from "@services/CommonService";
import { unwrapList, upgradeMediaUrl } from "@services/laravelAdapter";

/** Laravel auction row -> the shape AuctionCard.jsx reads */
export function toTemplateAuction(row) {
  return {
    id: row?.id,
    title: row?.title || "",
    thumbnail: upgradeMediaUrl(row?.thumbnail || row?.image_url || null),
    condition: row?.condition || null,
    currentBid: Number(row?.current_bid ?? row?.starting_price ?? 0),
    bidCount: Number(row?.bid_count) || 0,
    endsAt: row?.ends_at || null,
    isActive: !!row?.is_active,
    isUpcoming: !!row?.is_upcoming,
    isEnded: !!row?.is_ended,
  };
}

export async function fetchAuctions() {
  const res = await resilientFetch(`${baseURL}/auctions?paginate=24`, {
    headers: { Accept: "application/json", "Accept-Language": "en" },
    next: { revalidate: 60, tags: ["auctions"] },
  });
  const payload = await handleResponse(res);
  return unwrapList(payload).map(toTemplateAuction);
}

/**
 * Auction detail + bidding — Laravel returns fields the legacy frontend
 * consumes directly (title, images, condition, current_bid,
 * minimum_next_bid, bid_count, time_remaining_seconds, ends_at, status,
 * winner, starting_price, min_bid_increment, reserve_price,
 * auto_extend_minutes, description, branch, product{...}), so this is
 * passed through mostly as-is rather than remapped.
 */
const authHeaders = (headers) => ({
  Accept: "application/json",
  "Accept-Language": "en",
  ...(headers?.authorization ? { Authorization: headers.authorization } : {}),
});

export async function fetchAuctionDetail(id, headers) {
  const res = await resilientFetch(`${baseURL}/auctions/${id}`, {
    headers: authHeaders(headers),
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function fetchAuctionBids(id) {
  const res = await resilientFetch(`${baseURL}/auctions/${id}/bids`, {
    headers: { Accept: "application/json", "Accept-Language": "en" },
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function fetchBidRequirements(headers, id) {
  const res = await resilientFetch(`${baseURL}/auctions/${id}/bid-requirements`, {
    headers: authHeaders(headers),
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function placeBid(headers, id, amount) {
  const res = await resilientFetch(`${baseURL}/auctions/${id}/bid`, {
    method: "POST",
    headers: { ...authHeaders(headers), "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ amount }),
  });
  return handleResponse(res);
}

export async function payAuctionDeposit(headers, id, { paymentMethod, returnUrl, cancelUrl }) {
  const res = await resilientFetch(`${baseURL}/auctions/${id}/pay-deposit`, {
    method: "POST",
    headers: { ...authHeaders(headers), "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      payment_method: paymentMethod,
      ...(returnUrl ? { return_url: returnUrl } : {}),
      ...(cancelUrl ? { cancel_url: cancelUrl } : {}),
    }),
  });
  return handleResponse(res);
}

/** Bids the current user has placed — Laravel `GET /auctions/my-bids`. */
export async function fetchMyBids(headers) {
  const res = await resilientFetch(`${baseURL}/auctions/my-bids`, {
    headers: authHeaders(headers),
    cache: "no-store",
  });
  return handleResponse(res);
}

/** Auctions the current user has won — Laravel `GET /auctions/won`. */
export async function fetchMyWonAuctions(headers) {
  const res = await resilientFetch(`${baseURL}/auctions/won`, {
    headers: authHeaders(headers),
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function confirmAuctionDeposit(headers, id) {
  const res = await resilientFetch(`${baseURL}/auctions/${id}/confirm-deposit`, {
    method: "POST",
    headers: authHeaders(headers),
    cache: "no-store",
  });
  return handleResponse(res);
}
