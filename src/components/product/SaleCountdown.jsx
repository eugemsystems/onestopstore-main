"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

const getRemaining = (endDate) => {
  const diff = new Date(endDate).getTime() - Date.now();
  if (!Number.isFinite(diff) || diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
};

/**
 * Sale countdown banner shown on the product detail page — ports the
 * legacy frontend's OfferTimer.jsx (fire icon + "Hurry up, sale ends in"
 * header, four boxed units) onto the adapter's `raines.saleExpiredAt`.
 */
const SaleCountdown = ({ endDate }) => {
  // Start at null (not a computed value) so the very first client render
  // matches the server-rendered markup exactly — computing the real,
  // time-sensitive countdown during SSR vs. hydration always differs by
  // however many seconds elapsed in between, which React flags as a
  // hydration mismatch (error #418). The real value is filled in by the
  // effect below, after mount.
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    setRemaining(getRemaining(endDate));
    const timer = setInterval(() => setRemaining(getRemaining(endDate)), 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (!remaining) return null;

  const pad = (n) => String(n).padStart(2, "0");
  const units = [
    { value: remaining.days, label: "Days" },
    { value: remaining.hours, label: "Hours" },
    { value: remaining.minutes, label: "Min" },
    { value: remaining.seconds, label: "Sec" },
  ];

  return (
    <div className="mb-6 rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 px-4 py-3.5 dark:border-red-900/40 dark:from-red-950/30 dark:to-red-950/10">
      <div className="mb-3 flex items-center justify-center gap-1.5">
        <Flame className="h-4 w-4 animate-pulse text-red-600" />
        <span className="text-xs font-bold uppercase tracking-wide text-red-700 dark:text-red-400">
          Hurry up, sale ends in
        </span>
      </div>
      <div className="flex items-center justify-center gap-1.5">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-1.5">
            <div
              className={`flex min-w-12 flex-col items-center rounded-lg border px-1.5 py-1 shadow-sm ${
                i === units.length - 1
                  ? "border-red-300 bg-white dark:border-red-800 dark:bg-red-950/40"
                  : "border-red-200/80 bg-white dark:border-red-900/40 dark:bg-red-950/40"
              }`}
            >
              <span className="text-lg font-extrabold leading-tight text-foreground tabular-nums">
                {pad(unit.value)}
              </span>
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                {unit.label}
              </span>
            </div>
            {i < units.length - 1 && (
              <span className="text-lg font-bold text-red-300">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SaleCountdown;
