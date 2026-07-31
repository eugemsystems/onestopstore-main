"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiCalendar, FiShield, FiCheckCircle } from "react-icons/fi";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { checkLaybyExistingAction } from "@lib/actions/layby.actions";
import LaybyApplyModal from "./LaybyApplyModal";

/**
 * "Buy now, pay later" banner for the product detail page — ports the
 * legacy frontend's LaybyCard.jsx eligibility + apply CTA (deposit %,
 * duration options, existing-application detection) with a fresh visual
 * treatment consistent with this storefront's design system.
 */
const LaybyBanner = ({ product, matchedVariant, requiresVariant, stock, price }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { formatPrice } = useUtilsFunction();
  const [modalOpen, setModalOpen] = useState(false);
  const [existingApp, setExistingApp] = useState(null);

  const eligibilityData = matchedVariant?.laybyEligibility || product?.raines?.laybyEligibility;
  const isEligible = !!eligibilityData?.eligible;

  const needsVariation = requiresVariant && !matchedVariant;
  const isOutOfStock = !stock || stock < 1;
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    if (!isLoggedIn || !isEligible || !product?.id) {
      setExistingApp(null);
      return;
    }
    let cancelled = false;
    checkLaybyExistingAction(product.id, matchedVariant?.id).then(({ data }) => {
      if (cancelled) return;
      if (data?.has_existing) {
        setExistingApp({ id: data.application_id, status: data.status });
      } else {
        setExistingApp(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, isEligible, product?.id, matchedVariant?.id]);

  const durationLabel = useMemo(() => {
    const durations = eligibilityData?.available_durations || [];
    if (durations.length === 0) return "";
    if (durations.length === 1) return `${durations[0]} months`;
    return `${durations.slice(0, -1).join(", ")} or ${durations[durations.length - 1]} months`;
  }, [eligibilityData]);

  if (!isEligible || !eligibilityData) return null;

  const depositAmount = ((price || 0) * (eligibilityData.deposit_percentage || 0)) / 100;

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (needsVariation) return;
    setModalOpen(true);
  };

  const disabled = needsVariation || isOutOfStock || !!existingApp;

  return (
    <>
      <div className="relative mt-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-foreground to-foreground/90 p-5 text-background">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20">
            <FiCalendar size={20} className="text-indigo-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Buy now, pay later</h4>
            <p className="text-xs text-background/60">Split this purchase into easy payments</p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-background/10 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-background/50">
              Deposit
            </div>
            <div className="text-sm font-extrabold">
              {eligibilityData.deposit_percentage}%{" "}
              <span className="text-xs font-medium text-background/60">
                ({formatPrice(depositAmount)})
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-background/10 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-background/50">
              Payment period
            </div>
            <div className="text-sm font-extrabold">{durationLabel}</div>
          </div>
        </div>

        <ul className="mb-4 space-y-1.5">
          {["0% interest — pay only the item price", "Quick approval in 1–2 business days", "No credit check required"].map(
            (line) => (
              <li key={line} className="flex items-center gap-2 text-xs text-background/80">
                <FiCheckCircle size={13} className="shrink-0 text-indigo-400" />
                {line}
              </li>
            ),
          )}
        </ul>

        {existingApp && (
          <a
            href={`/user/laybys/${existingApp.id}`}
            className="mb-3 block rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/25"
          >
            {existingApp.status === "awaiting_documents"
              ? "📄 Awaiting your ID documents — continue application →"
              : "⏳ Application already in progress — view status →"}
          </a>
        )}

        <button
          type="button"
          onClick={handleClick}
          disabled={disabled && isLoggedIn}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-background py-3 text-sm font-bold text-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiShield size={16} />
          {!isLoggedIn
            ? "Log in to apply for layby"
            : isOutOfStock
              ? "Out of stock"
              : needsVariation
                ? "Select a variation first"
                : existingApp
                  ? "Application already active"
                  : "Apply for layby now"}
        </button>
      </div>

      {isEligible && (
        <LaybyApplyModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          product={product}
          matchedVariant={matchedVariant}
          eligibilityData={eligibilityData}
          currentPrice={price || 0}
        />
      )}
    </>
  );
};

export default LaybyBanner;
