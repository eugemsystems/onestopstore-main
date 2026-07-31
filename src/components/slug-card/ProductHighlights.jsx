"use client";

import React from "react";
import { FiDollarSign, FiHome, FiRepeat, FiShieldOff } from "react-icons/fi";
import { BsTruck, BsShieldCheck } from "react-icons/bs";

/**
 * Product-detail "Highlights" panel.
 * Ports the legacy frontend's ProductDeliveryInformation.jsx +
 * layby_eligibility badge onto real per-product data (delivery estimate,
 * stock status, layby availability), plus static trust-badge copy for the
 * rest — the old static i18n Card.jsx it replaces rendered empty text
 * (storeCustomization.slug.card_description_* was never populated).
 */
const ProductHighlights = ({ product }) => {
  const r = product?.raines || {};

  const deliveryText = r.estimatedDeliveryText;
  const deliveryColor = (() => {
    if (!deliveryText) return null;
    const lower = deliveryText.toLowerCase();
    if (lower.includes("back order")) return "text-amber-700";
    if (
      lower.includes("same day") ||
      lower.includes("same delivery") ||
      lower.includes("today") ||
      lower.includes("tomorrow")
    )
      return "text-green-700";
    return "text-blue-700";
  })();

  return (
    <ul className="my-0 space-y-1">
      {deliveryText && (
        <li className="flex items-center py-2">
          <span className={`text-lg mr-3 ${deliveryColor}`}>
            <BsTruck />
          </span>
          <p className="font-sans leading-5 text-sm text-muted-foreground">
            {deliveryText}
          </p>
        </li>
      )}

      {r.stockStatus && r.stockStatus !== "in_stock" && (
        <li className="flex items-center py-2">
          <span className="text-lg text-red-600 mr-3">
            <FiShieldOff />
          </span>
          <p className="font-sans leading-5 text-sm text-muted-foreground capitalize">
            {r.stockStatus.replace(/_/g, " ")}
          </p>
        </li>
      )}

      {r.laybyEligible && (
        <li className="flex items-center py-2">
          <span className="text-lg text-[#4f3488] mr-3">
            <BsShieldCheck />
          </span>
          <p className="font-sans leading-5 text-sm text-muted-foreground">
            Layby available
            {r.laybyDepositPercentage
              ? ` — ${r.laybyDepositPercentage}% deposit`
              : ""}
          </p>
        </li>
      )}

      <li className="flex items-center py-2">
        <span className="text-lg text-muted-foreground mr-3">
          <FiHome />
        </span>
        <p className="font-sans leading-5 text-sm text-muted-foreground">
          Nationwide delivery across Zimbabwe
        </p>
      </li>
      <li className="flex items-center py-2">
        <span className="text-lg text-muted-foreground mr-3">
          <FiDollarSign />
        </span>
        <p className="font-sans leading-5 text-sm text-muted-foreground">
          Secure checkout, multiple payment options
        </p>
      </li>
      <li className="flex items-center py-2">
        <span className="text-lg text-muted-foreground mr-3">
          <FiRepeat />
        </span>
        <p className="font-sans leading-5 text-sm text-muted-foreground">
          Easy returns on eligible items
        </p>
      </li>
    </ul>
  );
};

export default ProductHighlights;
