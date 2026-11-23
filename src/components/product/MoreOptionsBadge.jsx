"use client";

import { useState } from "react";
import { IoHelpCircleOutline } from "react-icons/io5";

/**
 * "More Options ?" badge for product cards. Hover / focus / tap shows a tooltip explaining that the
 * product has several prices for different delivery times.
 */
export default function MoreOptionsBadge({ className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={`relative inline-flex items-center gap-1 ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen((v) => !v);
      }}
      tabIndex={0}
      role="button"
      aria-label="More options"
    >
      <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold leading-4 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
        More Options
      </span>
      <IoHelpCircleOutline className="text-sm text-cyan-700 dark:text-cyan-300" />
      {open && (
        <span className="absolute bottom-full left-0 z-30 mb-1 w-52 rounded-lg border border-border bg-popover p-2 text-left text-[11px] font-normal leading-snug text-popover-foreground shadow-lg">
          This product has several options with different prices for different delivery times. Open
          the product to choose the one you want.
        </span>
      )}
    </span>
  );
}
