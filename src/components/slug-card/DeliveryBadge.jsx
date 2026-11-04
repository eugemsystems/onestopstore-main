"use client";

import { BsTruck } from "react-icons/bs";

/**
 * Delivery badge shown under the price on the product page, e.g. "Same Day Delivery Lusaka".
 * Colour follows the delivery promise: green = same day / tomorrow, amber = back order,
 * blue = everything else (e.g. "Ships in 3-5 work days").
 */
const DeliveryBadge = ({ text }) => {
  if (!text) return null;

  const lower = String(text).toLowerCase();
  const isBackOrder = lower.includes("back order");
  const isFast =
    lower.includes("same day") ||
    lower.includes("same delivery") ||
    lower.includes("today") ||
    lower.includes("tomorrow");

  const colours = isBackOrder
    ? "bg-amber-700 border-amber-800"
    : isFast
      ? "bg-green-700 border-green-800"
      : "bg-blue-700 border-blue-800";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold text-white ${colours}`}
    >
      <BsTruck className="text-sm" />
      {text}
    </span>
  );
};

export default DeliveryBadge;
