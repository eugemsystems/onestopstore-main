"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiClock } from "react-icons/fi";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { getUserSession } from "@lib/auth-client";
import { getAuctionBidsAction } from "@lib/actions/auction.actions";
import CountdownTimer from "./CountdownTimer";
import BidPanel from "./BidPanel";

const CONDITION_LABELS = {
  damaged: "Damaged",
  "boxed-damaged": "Damaged Box",
  "no-box": "No Box",
  returned: "Returned",
  dented: "Dented",
  "missing-accessories": "Missing Accessories",
  refurbished: "Refurbished",
  "as-is": "As-Is",
};

const POLL_MS = 5000;

const AuctionDetailView = ({ auction: initialAuction, paymentMethods }) => {
  const { formatPrice } = useUtilsFunction();
  const userInfo = getUserSession();

  const [bidState, setBidState] = useState({
    current_bid: initialAuction.current_bid,
    minimum_next_bid: initialAuction.minimum_next_bid,
    bid_count: initialAuction.bid_count,
    time_remaining_seconds: initialAuction.time_remaining_seconds,
    ends_at: initialAuction.ends_at,
    status: initialAuction.status,
    winner: initialAuction.winner,
  });
  const [bidHistory, setBidHistory] = useState([]);
  const [activeImg, setActiveImg] = useState(0);

  const pollRef = useRef(null);
  const hiddenRef = useRef(false);

  const applyBidState = useCallback((data) => {
    setBidState((prev) => ({
      ...prev,
      current_bid: data.current_bid,
      minimum_next_bid: data.minimum_next_bid,
      bid_count: data.bid_count,
      time_remaining_seconds: data.time_remaining_seconds,
      status: data.status,
      winner: data.winner ?? prev?.winner,
      ends_at: data.ends_at ?? prev?.ends_at,
    }));
  }, []);

  const pollBids = useCallback(async () => {
    if (hiddenRef.current) return;
    try {
      const { data } = await getAuctionBidsAction(initialAuction.id);
      if (data) {
        applyBidState(data);
        if (data.bids) setBidHistory(data.bids);
      }
    } catch {
      // ignore transient poll failures
    }
  }, [initialAuction.id, applyBidState]);

  useEffect(() => {
    const onVisibility = () => {
      hiddenRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    pollBids();
    pollRef.current = setInterval(pollBids, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [pollBids]);

  const gallery = (auction => (auction.images || []).filter(Boolean))(initialAuction);
  const hasImages = gallery.length > 0;

  const isActive = bidState?.status === "active" && bidState?.time_remaining_seconds > 0;
  const isEnded = bidState?.status === "ended" || bidState?.time_remaining_seconds === 0;
  const isUpcoming = !isActive && !isEnded;

  const currentBid = parseFloat(bidState?.current_bid ?? initialAuction.starting_price);
  const minNextBid = parseFloat(bidState?.minimum_next_bid ?? initialAuction.minimum_next_bid);
  const bidCount = bidState?.bid_count ?? initialAuction.bid_count ?? 0;
  const product = initialAuction.product;
  const conditionLabel = CONDITION_LABELS[initialAuction.condition] || initialAuction.condition;

  return (
    <div className="mx-auto max-w-screen-xl px-3 sm:px-10 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5">
        <Link href="/auctions" className="text-primary font-semibold hover:underline">
          🔨 Auctions
        </Link>
        <span>/</span>
        <span className="line-clamp-1">{initialAuction.title}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        {/* Gallery */}
        <div>
          <div className="relative rounded-2xl overflow-hidden bg-white border border-border aspect-square">
            {hasImages ? (
              <Image
                src={gallery[activeImg]}
                alt={initialAuction.title}
                fill
                className="object-contain p-4"
                sizes="(max-width: 1024px) 100vw, 560px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-7xl">🔨</div>
            )}
            <div
              className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-extrabold text-white ${
                isActive ? "bg-emerald-600" : isEnded ? "bg-muted-foreground" : "bg-blue-600"
              }`}
            >
              {isActive ? "🟢 LIVE" : isEnded ? "🔴 Ended" : "🗓 Upcoming"}
            </div>
            {conditionLabel && (
              <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold uppercase text-white">
                {conditionLabel}
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-16 rounded-lg overflow-hidden border-2 shrink-0 bg-muted ${
                    i === activeImg ? "border-primary" : "border-border"
                  }`}
                >
                  <Image src={img} alt="" width={64} height={64} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bid panel */}
        <div>
          <h1 className="text-2xl font-extrabold text-foreground mb-4">{initialAuction.title}</h1>

          {isActive && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-5 py-4 mb-5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wide text-primary flex items-center gap-1.5">
                <FiClock /> Auction closes in
              </span>
              <CountdownTimer endsAt={bidState.ends_at ?? initialAuction.ends_at} onExpired={pollBids} large />
            </div>
          )}
          {isUpcoming && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 mb-5">
              🗓 This auction hasn&apos;t started yet.
            </div>
          )}
          {isEnded && (
            <div className="rounded-2xl border border-border bg-muted/40 px-5 py-4 mb-5">
              <p className="font-extrabold text-muted-foreground mb-1.5">🏁 Auction Ended</p>
              {bidState?.winner && (
                <p className="text-sm text-emerald-600">
                  🏆 Won by <strong>{bidState.winner.name?.split(" ").pop()}</strong> for{" "}
                  <strong>{formatPrice(initialAuction.winner_bid ?? currentBid)}</strong>
                </p>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card px-5 py-4 mb-5">
            <div className="flex items-end justify-between mb-1.5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
                  Current Bid
                </p>
                <p className="text-4xl font-extrabold text-primary leading-none">{formatPrice(currentBid)}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-foreground leading-none">{bidCount}</p>
                <p className="text-xs text-muted-foreground">bids</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Starting from {formatPrice(initialAuction.starting_price)}
            </p>
          </div>

          <BidPanel
            auction={initialAuction}
            minimumNextBid={minNextBid}
            isActive={isActive}
            paymentMethods={paymentMethods}
            onBidPlaced={applyBidState}
          />

          <div className="flex flex-col gap-2 mt-4">
            {initialAuction.auto_extend_minutes > 0 && (
              <div className="rounded-lg border border-border bg-muted/30 px-3.5 py-2 text-xs text-muted-foreground">
                ⚡ Auto-extends {initialAuction.auto_extend_minutes}m on last-minute bids
              </div>
            )}
            <div className="rounded-lg border border-border bg-muted/30 px-3.5 py-2 text-xs text-muted-foreground">
              🔒 Auction items sold as-is. No returns.
            </div>
            {product && (
              <div className="rounded-lg border border-border bg-muted/30 px-3.5 py-2 text-xs text-muted-foreground">
                🔗 Original product:{" "}
                <Link href={`/product/${product.slug}`} target="_blank" className="text-primary font-semibold">
                  {product.name}
                </Link>
              </div>
            )}
          </div>

          {userInfo && bidHistory.length > 0 && (
            <div className="mt-4 rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-bold text-foreground">📊 Bid History</span>
                <span className="text-xs text-muted-foreground">
                  {bidHistory.length} bid{bidHistory.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {bidHistory.map((bid, i) => (
                  <div
                    key={bid.id}
                    className={`flex items-center justify-between px-4 py-2 border-b border-border last:border-b-0 ${
                      i === 0 ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                          i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {i === 0 ? "👑" : i + 1}
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${i === 0 ? "text-primary" : "text-foreground"}`}>
                          {bid.bidder}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(bid.created_at).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-extrabold ${i === 0 ? "text-primary" : "text-foreground"}`}>
                      {formatPrice(bid.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auction info card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg shrink-0">
            🔨
          </div>
          <div>
            <p className="font-extrabold text-foreground">{initialAuction.title}</p>
            <p className="text-xs text-muted-foreground">Auction Item Details</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2">
          <div className="p-6 border-b md:border-b-0 md:border-r border-border">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-3">
              📋 Description
            </p>
            {initialAuction.description ? (
              <div
                className="text-sm text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: initialAuction.description }}
              />
            ) : (
              <p className="text-sm italic text-muted-foreground">
                No description provided for this auction item.
              </p>
            )}
          </div>
          <div className="p-6">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-3">
              📋 Auction Specifications
            </p>
            {[
              ["Condition", conditionLabel],
              ["Branch", initialAuction.branch],
              ["Starting Price", formatPrice(initialAuction.starting_price)],
              ["Min Bid Increment", formatPrice(initialAuction.min_bid_increment)],
              initialAuction.reserve_price ? ["Reserve Price", formatPrice(initialAuction.reserve_price)] : null,
              initialAuction.auto_extend_minutes > 0
                ? ["Auto-Extend", `${initialAuction.auto_extend_minutes} min`]
                : null,
            ]
              .filter(Boolean)
              .map(([label, val]) => (
                <div key={label} className="flex justify-between py-2 border-b border-border/60 last:border-b-0">
                  <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                  <span className="text-sm font-semibold text-foreground">{val}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Linked product info */}
      {product && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden mt-5">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg shrink-0">
              📦
            </div>
            <div>
              <p className="font-extrabold text-foreground">{product.name}</p>
              {product.slug && (
                <Link
                  href={`/product/${product.slug}`}
                  target="_blank"
                  className="text-xs font-semibold text-primary"
                >
                  View original product listing →
                </Link>
              )}
            </div>
          </div>
          <div className="p-6">
            {product.description ? (
              <div
                className="text-sm text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="text-sm italic text-muted-foreground">No description available for this product.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionDetailView;
