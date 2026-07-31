"use client";

import useUtilsFunction from "@hooks/useUtilsFunction";
import { getFromPrice } from "@utils/getFromPrice";

const Discount = ({ discount, product, slug, modal }) => {
  const { getNumber } = useUtilsFunction();

  // Check if product has campaign data from backend enrichment
  const campaign = product?.campaign;
  const isInCampaign = !!(campaign && campaign.inCampaign !== false);

  // For variation products, base the badge % on the cheapest variant —
  // the same one the "From $X" price display uses — not just the first.
  const fromPrice = getFromPrice(product);

  const price = isInCampaign
    ? getNumber(campaign.campaignPrice)
    : getNumber(fromPrice.price);

  const originalPrice = isInCampaign
    ? getNumber(campaign.campaignOriginalPrice)
    : getNumber(fromPrice.originalPrice);

  const discountPercentage =
    originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  // Campaign items get a distinct orange/amber badge style
  const campaignBadgeClass = modal
    ? "absolute z-10 left-4 top-4 inline-flex items-center rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-500/20 ring-inset"
    : slug
      ? "inline-flex items-center rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-500/20 ring-inset"
      : "absolute z-10 left-3 top-3 inline-flex items-center rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-500/20 ring-inset";

  const pct = discount !== undefined ? discount : discountPercentage;

  // Card badge: a compact two-tone "sale flag" pinned top-LEFT — clear of the
  // wishlist/compare icons that sit top-right, unlike the old flat pill which
  // used to render underneath them.
  if (!modal && !slug && pct > 1) {
    return (
      <span
        className={`absolute z-10 left-3 top-3 flex flex-col items-center overflow-hidden rounded-lg text-white shadow-md ${
          isInCampaign ? "bg-orange-500 shadow-orange-500/30" : "bg-red-600 shadow-red-600/30"
        }`}
      >
        <span className="px-2 pt-1 text-sm font-extrabold leading-none">
          -{pct}%
        </span>
        <span
          className={`w-full px-2 pb-1 pt-0.5 text-center text-[9px] font-semibold uppercase tracking-wide leading-none ${
            isInCampaign ? "bg-orange-600/80" : "bg-red-700/80"
          }`}
        >
          {isInCampaign ? "Deal" : "Sale"}
        </span>
      </span>
    );
  }

  // Regular discount badge style (product detail page / modal)
  const regularBadgeClass = modal
    ? "absolute z-10 left-4 top-4 inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 ring-inset"
    : "inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 ring-inset";

  if (pct > 1) {
    return (
      <span className={isInCampaign ? campaignBadgeClass : regularBadgeClass}>
        {pct}% Off
      </span>
    );
  }

  return null;
};

export default Discount;
