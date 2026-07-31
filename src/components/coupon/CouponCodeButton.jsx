"use client";

import CopyToClipboard from "@components/common/CopyToClipboard";
import React, { useState } from "react";

const CouponCodeButton = ({ coupon }) => {
  const [copiedCode, setCopiedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopied = (code) => {
    setCopiedCode(code);
    setCopied(true);
  };

  return (
    <CopyToClipboard
      text={coupon.couponCode}
      onCopy={() => handleCopied(coupon.couponCode)}
    >
      <button className="block w-full">
        {copied && coupon.couponCode === copiedCode ? (
          <span className="text-primary text-sm leading-7 font-semibold">
            Copied!
          </span>
        ) : (
          <span className="uppercase  font-semibold text-sm leading-7 text-primary">
            {coupon.couponCode}{" "}
          </span>
        )}
      </button>
    </CopyToClipboard>
  );
};

export default CouponCodeButton;
