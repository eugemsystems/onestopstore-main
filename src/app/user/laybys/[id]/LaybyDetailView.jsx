"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { FiArrowLeft, FiCalendar, FiCheck, FiCreditCard } from "react-icons/fi";
import useUtilsFunction from "@hooks/useUtilsFunction";
import CheckoutPaymentOptions from "@components/checkout/CheckoutPaymentOptions";
import { Button } from "@components/ui/button";
import { payLaybyAction } from "@lib/actions/account-extras.actions";
import { notifyError, notifySuccess } from "@utils/toast";

const STATUS_LABEL = {
  pending: "Under Review",
  approved: "Approved",
  active: "Active",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const statusColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (["completed"].includes(s)) return "bg-emerald-50 text-emerald-600 border-emerald-200";
  if (["active", "approved"].includes(s)) return "bg-blue-50 text-blue-600 border-blue-200";
  if (s === "pending") return "bg-amber-50 text-amber-600 border-amber-200";
  if (["rejected", "cancelled"].includes(s)) return "bg-red-50 text-red-600 border-red-200";
  return "bg-muted text-muted-foreground border-border";
};

const LaybyDetailView = ({ application, error, paymentMethods }) => {
  const router = useRouter();
  const params = useParams();
  const { formatPrice, showDateFormat } = useUtilsFunction();
  const [payMethod, setPayMethod] = useState("");
  const [paying, setPaying] = useState(false);
  const [showPay, setShowPay] = useState(false);

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        {error}
      </div>
    );
  }
  if (!application) return null;

  const progress = Math.min(
    100,
    Math.round((Number(application.total_paid || 0) / Number(application.total_amount || 1)) * 100),
  );
  const canPay = application.status === "active" && application.balance_remaining > 0;
  const payAmount = Math.min(application.monthly_amount, application.balance_remaining);

  const handlePay = async () => {
    if (!payMethod) {
      notifyError("Please select a payment method");
      return;
    }
    setPaying(true);
    const { data, error: err } = await payLaybyAction(params.id, payAmount, payMethod);
    setPaying(false);
    if (err) {
      notifyError(err);
      return;
    }
    if (data?.redirect_url) {
      window.location.href = data.redirect_url;
      return;
    }
    notifySuccess(data?.message || "Payment submitted");
    setShowPay(false);
    router.refresh();
  };

  return (
    <div>
      <Link
        href="/user/laybys"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary mb-4"
      >
        <FiArrowLeft /> Back to Laybys
      </Link>

      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-6 text-white mb-4">
        <div className="flex items-start gap-4 mb-5">
          {application.product?.product_thumbnail?.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={application.product.product_thumbnail.image_url}
              alt={application.product_name}
              className="h-20 w-20 rounded-xl object-contain bg-white/10 border border-white/10"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs text-white/40 font-semibold">{application.application_number}</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusColor(application.status)}`}>
                {STATUS_LABEL[application.status] || application.status}
              </span>
            </div>
            <h2 className="font-bold text-lg line-clamp-2">{application.product_name}</h2>
            <p className="text-xs text-white/40 flex items-center gap-1.5 mt-1.5">
              <FiCalendar size={12} /> {showDateFormat(application.created_at)} •{" "}
              {application.duration_months} months plan
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-white/50 mb-1.5">
            <span>Payment Progress</span>
            <span className="font-bold text-white">{progress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full ${progress === 100 ? "bg-emerald-400" : "bg-indigo-400"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-2">
            <span className="text-emerald-400 font-semibold">
              ✓ Paid {formatPrice(application.total_paid)}
            </span>
            <span className="text-white/40">Balance {formatPrice(application.balance_remaining)}</span>
          </div>
        </div>
      </div>

      {application.status === "completed" && application.order && (
        <div className="rounded-xl bg-emerald-600 text-white p-4 mb-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold">Layby Complete!</p>
              <p className="text-sm text-white/80">Converted to Order #{application.order.order_number}</p>
            </div>
          </div>
          <Link
            href={`/user/order/details/${application.order.order_number}`}
            className="text-sm font-semibold bg-white/15 border border-white/20 rounded-lg px-4 py-2"
          >
            View Order
          </Link>
        </div>
      )}

      {application.status === "pending" && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-4">
          <p className="font-semibold text-amber-800">Under Review</p>
          <p className="text-sm text-amber-700 mt-1">
            We'll review your application within 1-2 business days and notify you by email.
          </p>
        </div>
      )}

      {application.status === "rejected" && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-4">
          <p className="font-semibold text-red-800">Application Rejected</p>
          <p className="text-sm text-red-700 mt-1">
            {application.rejection_reason || "Please contact support for more information."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: "Total Amount", value: application.total_amount },
          { label: "Amount Paid", value: application.total_paid },
          { label: "Deposit", value: application.deposit_amount },
          { label: "Monthly", value: application.monthly_amount },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
            <p className="text-xl font-extrabold text-foreground">{formatPrice(value)}</p>
          </div>
        ))}
      </div>

      {canPay && (
        <div className="rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <FiCreditCard className="text-indigo-300" size={20} />
            </div>
            <div>
              <p className="text-xs text-white/50 font-semibold">Balance Due</p>
              <p className="text-2xl font-extrabold">{formatPrice(application.balance_remaining)}</p>
            </div>
          </div>
          <Button onClick={() => setShowPay(true)} variant="create">
            Make Payment ({formatPrice(payAmount)})
          </Button>
        </div>
      )}

      {showPay && (
        <div className="rounded-xl border border-border bg-card p-5 mb-6">
          <h4 className="font-semibold mb-3">Select Payment Method</h4>
          <CheckoutPaymentOptions
            methods={paymentMethods}
            value={payMethod}
            onChange={setPayMethod}
          />
          <div className="flex gap-3 mt-4">
            <Button onClick={handlePay} disabled={paying} variant="create">
              {paying ? "Processing..." : `Pay ${formatPrice(payAmount)}`}
            </Button>
            <Button onClick={() => setShowPay(false)} variant="outline" disabled={paying}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {["approved", "active", "completed"].includes(application.status) && (
        <>
          <h3 className="font-semibold text-foreground mb-3">Payment History</h3>
          {application.payments?.length > 0 ? (
            <div className="space-y-2 mb-6">
              {application.payments.map((pay, idx) => {
                const done = pay.payment_status === "completed";
                return (
                  <div key={pay.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        done ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {done ? <FiCheck size={16} /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{formatPrice(pay.amount)}</span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            done ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {done ? "Paid" : pay.payment_status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {String(pay.payment_method).toUpperCase()} •{" "}
                        {showDateFormat(pay.paid_at || pay.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground mb-6">
              No payments yet.
            </div>
          )}
        </>
      )}

      <h3 className="font-semibold text-foreground mb-3">Product Details</h3>
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {[
          ["Product", application.product_name],
          application.variation_display_name ? ["Variation", application.variation_display_name] : null,
          ["Price", formatPrice(application.product_price)],
          ["Plan Duration", `${application.duration_months} months`],
          ["Currency", application.currency || "USD"],
        ]
          .filter(Boolean)
          .map(([label, value]) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium text-foreground text-right">{value}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default LaybyDetailView;
