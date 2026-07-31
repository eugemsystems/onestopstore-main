"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiClock } from "react-icons/fi";
import useUtilsFunction from "@hooks/useUtilsFunction";
import CountdownTimer from "@app/auctions/[id]/_components/CountdownTimer";

const CONDITION_CLASS = {
  damaged: "bg-red-50 text-red-600",
  refurbished: "bg-amber-50 text-amber-600",
};
const conditionClass = (c) => CONDITION_CLASS[c] || "bg-muted text-muted-foreground";

const AuctionThumb = ({ images, title }) => {
  const img = Array.isArray(images) ? images[0] : null;
  return img ? (
    <Image
      src={img}
      alt={title || "Auction"}
      width={56}
      height={56}
      className="h-14 w-14 shrink-0 rounded-lg object-cover border border-border"
    />
  ) : (
    <div className="h-14 w-14 shrink-0 rounded-lg bg-muted border border-border flex items-center justify-center text-2xl">
      🔨
    </div>
  );
};

const BidsList = ({ bids }) => {
  const { formatPrice } = useUtilsFunction();

  if (bids.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="text-5xl mb-3 opacity-40">🔨</div>
        <p className="mb-4">You haven&apos;t placed any bids yet</p>
        <Link
          href="/auctions"
          className="inline-block rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-bold"
        >
          Browse Auctions →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bids.map((bid) => {
        const a = bid.auction_item;
        if (!a) return null;
        const won = a.status === "ended" && a.winner_id == bid.user_id;
        return (
          <div
            key={bid.id}
            className="flex flex-wrap items-center gap-3.5 rounded-xl border border-border bg-card p-4"
          >
            <AuctionThumb images={a.images} title={a.title} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{a.title}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${conditionClass(a.condition)}`}>
                  {a.condition}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <FiClock size={11} />
                  {a.status === "active" ? (
                    <CountdownTimer endsAt={a.ends_at} />
                  ) : (
                    <span className="text-blue-600 font-semibold">
                      {a.status === "ended" ? "Ended" : a.status}
                    </span>
                  )}
                </span>
              </div>
            </div>
            <div className="text-right min-w-20">
              <p className="text-[11px] text-muted-foreground">Your Bid</p>
              <p className="font-extrabold text-foreground">{formatPrice(bid.amount)}</p>
              <p className={`text-[11px] font-bold ${won ? "text-emerald-600" : "text-muted-foreground"}`}>
                {a.status === "ended" ? (won ? "🏆 You Won!" : "Outbid") : `Now: ${formatPrice(a.current_bid ?? a.starting_price)}`}
              </p>
            </div>
            <Link
              href={`/auctions/${a.id}`}
              className="rounded-lg bg-muted px-3.5 py-2 text-xs font-bold text-foreground whitespace-nowrap"
            >
              View →
            </Link>
          </div>
        );
      })}
    </div>
  );
};

const WinsList = ({ wins, isBanned, banReason }) => {
  const { formatPrice } = useUtilsFunction();

  if (wins.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="text-5xl mb-3 opacity-40">🏆</div>
        <p className="mb-4">You haven&apos;t won any auctions yet</p>
        <Link
          href="/auctions"
          className="inline-block rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-bold"
        >
          Browse Live Auctions →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isBanned && (
        <div className="rounded-xl bg-gradient-to-br from-red-900 to-red-600 text-white p-4 flex gap-3.5">
          <span className="text-3xl shrink-0">🚫</span>
          <div>
            <p className="font-extrabold mb-1">Your Bidding &amp; Payment Privileges are Suspended</p>
            <p className="text-sm opacity-90">{banReason}</p>
            <p className="text-xs opacity-75 mt-1.5">
              Contact support to have your ban reviewed before payments can be processed.
            </p>
          </div>
        </div>
      )}

      {wins.map((auction) => {
        const paid = !!auction.order_id;
        const depositPaid = parseFloat(auction.deposit_paid ?? 0);
        const winnerBid = parseFloat(auction.winner_bid ?? 0);
        const deliveryCost = parseFloat(auction.delivery_cost ?? 0);
        const amountDue = Math.max(0, winnerBid + deliveryCost - depositPaid);
        const borderClass = isBanned && !paid ? "border-red-300" : paid ? "border-emerald-200" : "border-amber-200";

        return (
          <div key={auction.id} className={`rounded-xl border bg-card p-4 flex flex-col gap-3 ${borderClass}`}>
            <div className="flex flex-wrap items-center gap-3.5">
              <AuctionThumb images={auction.images} title={auction.title} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{auction.title}</p>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${conditionClass(auction.condition)}`}>
                  {auction.condition}
                </span>
              </div>
              <div className="text-right min-w-20">
                <p className="text-[11px] text-muted-foreground">
                  {paid && depositPaid > 0 ? "Balance Paid" : "Winning Bid"}
                </p>
                <p className={`font-extrabold text-lg ${paid ? "text-emerald-600" : isBanned ? "text-red-600" : "text-primary"}`}>
                  {formatPrice(paid ? amountDue : winnerBid)}
                </p>
                <p className={`text-[11px] font-bold ${paid ? "text-emerald-600" : isBanned ? "text-red-600" : "text-amber-600"}`}>
                  {paid ? "✅ Paid" : isBanned ? "🚫 Banned" : "⏳ Pending"}
                </p>
              </div>
              {paid ? (
                <span className="rounded-lg bg-emerald-50 text-emerald-600 px-3.5 py-2 text-xs font-bold">
                  Completed
                </span>
              ) : isBanned ? (
                <span
                  title={banReason}
                  className="rounded-lg bg-red-50 text-red-600 border border-red-200 px-3.5 py-2 text-xs font-bold whitespace-nowrap"
                >
                  🚫 Restricted
                </span>
              ) : (
                <Link
                  href={`/auctions/${auction.id}`}
                  className="rounded-lg bg-primary text-primary-foreground px-3.5 py-2 text-xs font-bold whitespace-nowrap"
                >
                  💳 Pay Now
                </Link>
              )}
            </div>

            {(depositPaid > 0 || deliveryCost > 0) && (
              <div className="rounded-lg bg-muted/50 border border-border px-3 py-2 text-xs text-muted-foreground flex gap-4 flex-wrap">
                <span>Winning Bid: <strong className="text-foreground">{formatPrice(winnerBid)}</strong></span>
                {deliveryCost > 0 && (
                  <span>Delivery: <strong className="text-red-600">+{formatPrice(deliveryCost)}</strong></span>
                )}
                {depositPaid > 0 && (
                  <span>Deposit Paid: <strong className="text-emerald-600">−{formatPrice(depositPaid)}</strong></span>
                )}
                <span>Balance Due: <strong className="text-primary">{formatPrice(amountDue)}</strong></span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const AuctionsAccountView = ({ bids, wins, isBanned, banReason }) => {
  const [tab, setTab] = useState("bids");

  return (
    <div>
      <h2 className="text-xl font-semibold mb-5">My Auctions</h2>

      <div className="flex mb-6 border-b border-border">
        <button
          type="button"
          onClick={() => setTab("bids")}
          className={`pb-2.5 px-1 mr-6 text-sm font-semibold border-b-2 transition-colors ${
            tab === "bids" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
          }`}
        >
          My Bids ({bids.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("wins")}
          className={`pb-2.5 px-1 text-sm font-semibold border-b-2 transition-colors ${
            tab === "wins" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
          }`}
        >
          My Wins ({wins.length})
        </button>
      </div>

      {tab === "bids" ? (
        <BidsList bids={bids} />
      ) : (
        <WinsList wins={wins} isBanned={isBanned} banReason={banReason} />
      )}
    </div>
  );
};

export default AuctionsAccountView;
