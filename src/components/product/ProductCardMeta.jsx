"use client";

import { FiTruck, FiClock, FiCreditCard } from "react-icons/fi";

/**
 * Delivery + layby meta row for product cards. The legacy frontend used a
 * solid-fill purple pill (`background:'#4f3488'`) copied 1:1 for both the
 * delivery estimate and the layby badge — this is a fresh, unified design:
 * a single outlined "meta strip" with small colored icon chips instead of
 * stacked solid pills, so it reads as one cohesive row rather than two
 * competing badges.
 */
const ProductCardMeta = ({ product }) => {
  const r = product?.raines || {};
  const deliveryText = r.estimatedDeliveryText;
  const laybyEligible = r.laybyEligible;

  if (!deliveryText && !laybyEligible) return null;

  const isBackOrder = deliveryText?.toLowerCase().includes("back order");
  // "Same day" gets its own vivid, high-visibility treatment distinct from
  // "tomorrow" -- it's the strongest delivery promise a product can carry,
  // so it should read as an eye-catching badge rather than blend into the
  // same muted-green text as next-day delivery.
  const isSameDay =
    !!deliveryText &&
    ["same day", "same delivery", "today"].some((k) =>
      deliveryText.toLowerCase().includes(k),
    );
  const isFast =
    isSameDay || (!!deliveryText && deliveryText.toLowerCase().includes("tomorrow"));

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-background/80 px-2 py-1.5 ring-1 ring-inset ring-border/60">
      {deliveryText && isSameDay ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm shadow-green-600/30">
          <FiClock size={10} />
          {deliveryText}
        </span>
      ) : (
        deliveryText && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full ${
                isBackOrder
                  ? "bg-amber-500/15 text-amber-600"
                  : isFast
                    ? "bg-green-500/15 text-green-600"
                    : "bg-blue-500/15 text-blue-600"
              }`}
            >
              {isFast ? <FiClock size={9} /> : <FiTruck size={9} />}
            </span>
            {deliveryText}
          </span>
        )
      )}
      {deliveryText && laybyEligible && (
        <span className="h-3 w-px bg-border" aria-hidden="true" />
      )}
      {laybyEligible && (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <FiCreditCard size={9} />
          </span>
          Layby available
        </span>
      )}
    </div>
  );
};

export default ProductCardMeta;
