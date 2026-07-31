"use client";

import Link from "next/link";
import Image from "next/image";
import { FiClock, FiTag } from "react-icons/fi";
import useUtilsFunction from "@hooks/useUtilsFunction";

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

const AuctionCard = ({ auction }) => {
  const { formatPrice } = useUtilsFunction();
  const conditionLabel = CONDITION_LABELS[auction.condition] || auction.condition;

  return (
    <Link
      href={`/auctions/${auction.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-48 w-full bg-white">
        {auction.thumbnail ? (
          <Image
            src={auction.thumbnail}
            alt={auction.title}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🔨</div>
        )}
        {conditionLabel && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">
            {conditionLabel}
          </span>
        )}
        {auction.isUpcoming && (
          <span className="absolute right-2 top-2 rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white">
            Upcoming
          </span>
        )}
        {auction.isEnded && (
          <span className="absolute right-2 top-2 rounded-full bg-muted-foreground px-2 py-0.5 text-[10px] font-semibold text-white">
            Ended
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-1 text-sm font-medium text-foreground">{auction.title}</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-muted-foreground">Current Bid</div>
            <div className="text-sm font-bold text-foreground">
              {formatPrice(auction.currentBid)}
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FiTag size={11} />
            {auction.bidCount} bid{auction.bidCount !== 1 ? "s" : ""}
          </div>
        </div>
        {auction.isActive && auction.endsAt && (
          <div className="flex items-center gap-1 text-[11px] text-red-600">
            <FiClock size={11} />
            Ends {new Date(auction.endsAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </Link>
  );
};

export default AuctionCard;
