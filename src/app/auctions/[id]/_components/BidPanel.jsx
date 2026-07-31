"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { getUserSession } from "@lib/auth-client";
import CheckoutPaymentOptions from "@components/checkout/CheckoutPaymentOptions";
import { notifyError, notifySuccess } from "@utils/toast";
import {
  getBidRequirementsAction,
  placeBidAction,
  payAuctionDepositAction,
  confirmAuctionDepositAction,
} from "@lib/actions/auction.actions";

const BidPanel = ({ auction, minimumNextBid, isActive, paymentMethods, onBidPlaced }) => {
  const router = useRouter();
  const { formatPrice } = useUtilsFunction();
  const userInfo = getUserSession();
  const isLoggedIn = !!userInfo;

  const [requirements, setRequirements] = useState(null);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [amount, setAmount] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDepositPay, setShowDepositPay] = useState(false);
  const [depositMethod, setDepositMethod] = useState("");
  const [payingDeposit, setPayingDeposit] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!amount && minimumNextBid) setAmount(String(minimumNextBid));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minimumNextBid]);

  useEffect(() => {
    if (!isLoggedIn || !isActive) return;

    const params = new URLSearchParams(window.location.search);
    const depositJustPaid = params.get("deposit_paid") === "1";

    const fetchReqs = async () => {
      setLoadingReqs(true);
      const { data } = await getBidRequirementsAction(auction.id);
      if (data) setRequirements(data);
      setLoadingReqs(false);
    };

    if (depositJustPaid) {
      (async () => {
        setConfirming(true);
        await confirmAuctionDepositAction(auction.id);
        await fetchReqs();
        setConfirming(false);
        const url = new URL(window.location.href);
        url.searchParams.delete("deposit_paid");
        window.history.replaceState({}, "", url.toString());
      })();
    } else {
      fetchReqs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isActive, auction.id]);

  if (!isActive) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/auctions/${auction.id}`);
      return;
    }
    setPlacing(true);
    setError("");
    setSuccess("");
    const { data, error: err } = await placeBidAction(auction.id, parseFloat(amount));
    setPlacing(false);
    if (err) {
      setError(err);
      // Refresh requirements in case a deposit/ban gate just kicked in
      const { data: reqs } = await getBidRequirementsAction(auction.id);
      if (reqs) setRequirements(reqs);
      return;
    }
    setSuccess(`Bid of ${formatPrice(amount)} placed!`);
    setAmount("");
    notifySuccess("Bid placed!");
    onBidPlaced?.(data);
  };

  if (!isLoggedIn) {
    return (
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">
          Minimum next bid: <strong className="text-foreground">{formatPrice(minimumNextBid)}</strong>
        </p>
        <p className="text-sm text-muted-foreground mb-3">Sign in to place a bid on this item</p>
        <button
          onClick={() => router.push(`/auth/login?redirect=/auctions/${auction.id}`)}
          className="w-full rounded-xl bg-primary text-primary-foreground font-bold py-3 text-sm"
        >
          Sign In to Bid
        </button>
      </div>
    );
  }

  if (loadingReqs || confirming) {
    return (
      <div className="text-center text-sm text-muted-foreground py-4">
        {confirming ? "Confirming your deposit payment..." : "Checking requirements..."}
      </div>
    );
  }

  if (requirements?.is_banned) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="font-bold text-red-600 mb-1.5">Account Restricted</p>
        <p className="text-sm text-red-700/80">
          {requirements.ban_message ||
            "Your account has been suspended from bidding due to non-payment of a previously won auction item."}
        </p>
      </div>
    );
  }

  const handlePayDeposit = async () => {
    if (!depositMethod) {
      notifyError("Please select a payment method");
      return;
    }
    setPayingDeposit(true);
    const origin = window.location.origin;
    const { data, error: err } = await payAuctionDepositAction(
      auction.id,
      depositMethod,
      `${origin}/auctions/${auction.id}?deposit_paid=1`,
      `${origin}/auctions/${auction.id}`,
    );
    setPayingDeposit(false);
    if (err) {
      notifyError(err);
      return;
    }
    const url = data?.url || data?.redirect_url || data?.payment_url;
    if (data?.paid) {
      const { data: reqs } = await getBidRequirementsAction(auction.id);
      if (reqs) setRequirements(reqs);
      setShowDepositPay(false);
      notifySuccess("Deposit paid!");
      return;
    }
    if (url) {
      window.location.href = url;
      return;
    }
    notifyError("Payment initiation failed. Please try again.");
  };

  if (requirements?.bid_fee_enabled && !requirements?.deposit_paid) {
    return (
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-3">
          Minimum next bid: <strong className="text-foreground">{formatPrice(minimumNextBid)}</strong>
        </p>
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
          <p className="font-bold text-foreground mb-1.5">Bid Deposit Required</p>
          <p className="text-sm text-muted-foreground mb-1.5">
            A refundable deposit of{" "}
            <strong className="text-foreground">{formatPrice(requirements.bid_fee_amount)}</strong>{" "}
            is required to participate in this auction.
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            If you win, this deposit is deducted from your final payment. If you don&apos;t win, it&apos;s
            refunded.
          </p>

          {!showDepositPay ? (
            <button
              onClick={() => setShowDepositPay(true)}
              className="w-full rounded-lg bg-primary text-primary-foreground font-bold py-2.5 text-sm"
            >
              Pay {formatPrice(requirements.bid_fee_amount)} Deposit to Bid
            </button>
          ) : (
            <div>
              <CheckoutPaymentOptions
                methods={paymentMethods}
                value={depositMethod}
                onChange={setDepositMethod}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handlePayDeposit}
                  disabled={payingDeposit}
                  className="flex-1 rounded-lg bg-primary text-primary-foreground font-bold py-2.5 text-sm disabled:opacity-60"
                >
                  {payingDeposit ? "Processing..." : `Pay ${formatPrice(requirements.bid_fee_amount)}`}
                </button>
                <button
                  onClick={() => setShowDepositPay(false)}
                  disabled={payingDeposit}
                  className="rounded-lg border border-border px-4 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2">
      {requirements?.bid_fee_enabled && requirements?.deposit_paid && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 mb-3">
          <span>✓</span>
          <span>Deposit paid ({formatPrice(requirements.bid_fee_amount)}). Deducted if you win.</span>
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-2">
        Minimum next bid: <strong className="text-foreground">{formatPrice(minimumNextBid)}</strong>
      </p>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={minimumNextBid}
          step="0.01"
          required
          placeholder={String(minimumNextBid)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
        <button
          type="submit"
          disabled={placing}
          className="w-full rounded-xl bg-primary text-primary-foreground font-bold py-3 text-sm disabled:opacity-60"
        >
          {placing ? "Placing bid..." : "Place Bid"}
        </button>
      </form>

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      {success && <p className="text-xs text-emerald-600 mt-2">{success}</p>}
      <p className="text-[11px] text-muted-foreground text-center mt-2">
        By placing a bid, you agree to purchase if you win.
      </p>
    </div>
  );
};

export default BidPanel;
