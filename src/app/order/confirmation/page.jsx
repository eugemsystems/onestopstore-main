"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import AuthAwareLink from "@components/common/AuthAwareLink";
import {
  IoCheckmarkCircleOutline,
  IoStorefrontOutline,
  IoNavigateOutline,
  IoPersonAddOutline,
} from "react-icons/io5";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const invoice = searchParams.get("invoice");
  const trackingId = searchParams.get("trackingId");

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 py-10 bg-background">
      <div className="max-w-lg w-full space-y-4">
        {/* Success Card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
          {/* Green header strip */}
          <div className="bg-linear-to-r from-primary/20 via-primary/10 to-primary/5 px-8 pt-8 pb-6 text-center border-b border-border">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-5 rounded-full bg-primary/10 ring-4 ring-primary/10">
              <IoCheckmarkCircleOutline className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Order Confirmed! 🎉
            </h1>
            <p className="text-sm text-muted-foreground">
              Thank you for your order. We&apos;ve received it and will process
              it shortly.
            </p>
          </div>

          {/* Order Details */}
          <div className="px-8 py-6 space-y-3">
            {invoice && (
              <div className="flex items-center justify-between py-2.5 border-b border-border/60">
                <span className="text-sm text-muted-foreground font-medium">
                  Invoice Number
                </span>
                <span className="text-sm font-bold text-foreground">
                  #{invoice}
                </span>
              </div>
            )}
            {trackingId && (
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-muted-foreground font-medium">
                  Tracking ID
                </span>
                <span className="text-sm font-mono font-bold text-primary bg-primary/8 px-2.5 py-1 rounded-lg">
                  {trackingId}
                </span>
              </div>
            )}
          </div>

          {/* Save tracking tip */}
          {trackingId && (
            <div className="mx-8 mb-6 flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <span className="text-amber-500 mt-0.5 text-base shrink-0">
                💡
              </span>
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                <strong>Save your Tracking ID!</strong> You can use it anytime
                to check your order status — no account required.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-8 pb-8 grid grid-cols-2 gap-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <IoStorefrontOutline className="h-4 w-4" />
              Continue Shopping
            </Link>
            {trackingId && (
              <Link
                href={`/track/${encodeURIComponent(trackingId)}`}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <IoNavigateOutline className="h-4 w-4" />
                Track Order
              </Link>
            )}
          </div>
        </div>

        {/* Guest CTA card — create account */}
        <div className="bg-card rounded-2xl border border-border px-6 py-5 flex items-start gap-4 shadow-sm">
          <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mt-0.5">
            <IoPersonAddOutline className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Create a free account
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Save your order history, get faster checkout next time, and track
              all your orders from one place.
            </p>
            <AuthAwareLink
              href="/auth/signup"
              className="inline-flex items-center mt-3 text-xs font-semibold text-primary hover:text-primary/80 underline-offset-2 hover:underline transition-colors"
            >
              Sign up — it&apos;s free →
            </AuthAwareLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
            <p className="text-sm text-muted-foreground">
              Loading your order...
            </p>
          </div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
