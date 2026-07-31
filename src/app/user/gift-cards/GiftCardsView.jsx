"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiGift, FiMail, FiCalendar } from "react-icons/fi";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { redeemVoucherAction } from "@lib/actions/account-extras.actions";
import { notifyError, notifySuccess } from "@utils/toast";

const formatCode = (value) => {
  const cleaned = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join("-").substring(0, 14);
};

const statusBadge = (voucher) => {
  if (voucher.status === "redeemed")
    return { label: "Redeemed", cls: "bg-muted text-muted-foreground" };
  if (voucher.expires_at && new Date(voucher.expires_at) < new Date())
    return { label: "Expired", cls: "bg-red-100 text-red-600" };
  return { label: "Active", cls: "bg-emerald-100 text-emerald-600" };
};

const GiftCardsView = ({ vouchers, error }) => {
  const router = useRouter();
  const { formatPrice, showDateFormat } = useUtilsFunction();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (!code || code.length < 14) {
      notifyError("Please enter a complete voucher code");
      return;
    }
    setLoading(true);
    const { data, error: err } = await redeemVoucherAction(code);
    setLoading(false);
    if (err) {
      notifyError(err);
      return;
    }
    notifySuccess(data?.message || "Gift card redeemed successfully!");
    setCode("");
    router.refresh();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-5">My Gift Cards</h2>

      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <h3 className="font-semibold text-foreground mb-3">Redeem a Gift Card</h3>
        <div className="flex gap-3 flex-wrap">
          <Input
            value={code}
            onChange={(e) => setCode(formatCode(e.target.value))}
            placeholder="XXXX-XXXX-XXXX"
            maxLength={14}
            className="flex-1 min-w-[200px] font-mono tracking-widest text-center"
          />
          <Button onClick={handleRedeem} disabled={loading || code.length < 14} variant="create">
            <FiGift className="mr-2" /> {loading ? "Redeeming..." : "Redeem Now"}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          {error}
        </div>
      ) : vouchers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vouchers.map((v) => {
            const badge = statusBadge(v);
            return (
              <div key={v.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="p-5 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-between">
                  <span className="text-2xl font-extrabold">
                    {formatPrice(v.amount)}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <FiMail /> Code sent to your email
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <FiCalendar size={12} /> Purchased
                    </span>
                    <span className="font-medium">{showDateFormat(v.created_at)}</span>
                  </p>
                  {v.expires_at && (
                    <p className="flex items-center justify-between">
                      <span className="text-muted-foreground">Expires</span>
                      <span className="font-medium">{showDateFormat(v.expires_at)}</span>
                    </p>
                  )}
                  {v.order?.order_number && (
                    <p className="flex items-center justify-between">
                      <span className="text-muted-foreground">Order</span>
                      <span className="font-medium">#{v.order.order_number}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          You haven't purchased any gift cards yet.
        </div>
      )}
    </div>
  );
};

export default GiftCardsView;
