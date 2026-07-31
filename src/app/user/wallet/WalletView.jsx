"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowUp, FiArrowDown, FiCalendar } from "react-icons/fi";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { requestWalletRefundAction } from "@lib/actions/account-extras.actions";
import { notifyError, notifySuccess } from "@utils/toast";

const WalletView = ({ data, error }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice, showDateFormat } = useUtilsFunction();
  const [confirming, setConfirming] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const balance = Number(data?.balance ?? 0);
  const nonCashableBalance = Number(data?.non_cashable_balance ?? 0);
  const totalBalance = balance + nonCashableBalance;
  const transactions = data?.transactions?.data || [];

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page);
    router.push(`/user/wallet?${params.toString()}`);
  };

  const handleRefund = async () => {
    if (balance <= 0) {
      notifyError("Wallet balance is zero");
      return;
    }
    setRequesting(true);
    const { data: res, error: err } = await requestWalletRefundAction();
    setRequesting(false);
    if (err) {
      notifyError(err);
      return;
    }
    notifySuccess("Refund request submitted. Your wallet has been debited.");
    setConfirming(false);
    router.refresh();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-5">My Wallet</h2>

      {error ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          {error}
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Regular Balance</p>
                  <p className="text-2xl font-bold text-foreground">{formatPrice(balance)}</p>
                </div>
                {nonCashableBalance > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Gift Card Balance</p>
                    <p className="text-xl font-bold text-indigo-500">
                      {formatPrice(nonCashableBalance)}
                    </p>
                    <p className="text-xs text-muted-foreground">Can only be used for purchases</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Total Available</p>
                  <p className="text-2xl font-bold text-primary">{formatPrice(totalBalance)}</p>
                </div>
              </div>

              {balance >= 4 &&
                (confirming ? (
                  <div className="flex gap-2">
                    <button
                      disabled={requesting}
                      onClick={handleRefund}
                      className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60"
                    >
                      {requesting ? "Processing..." : `Confirm refund ${formatPrice(balance)}`}
                    </button>
                    <button
                      disabled={requesting}
                      onClick={() => setConfirming(false)}
                      className="h-10 px-4 rounded-lg border border-border text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirming(true)}
                    className="h-10 px-4 rounded-lg border border-border text-sm font-semibold hover:bg-muted"
                  >
                    Request Wallet Refund
                  </button>
                ))}
            </div>
          </div>

          <h3 className="font-semibold text-foreground mb-3">Transactions</h3>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((t, i) => {
                const isCredit = String(t.type).toLowerCase() === "credit";
                const color = isCredit ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" : "text-red-600 bg-red-50 dark:bg-red-900/20";
                const Icon = isCredit ? FiArrowUp : FiArrowDown;
                return (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color}`}>
                      <Icon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{t.detail || "Transaction"}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <FiCalendar size={11} /> {showDateFormat(t.created_at)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-bold ${color.split(" ")[0]}`}>
                        {isCredit ? "+" : "-"}
                        {formatPrice(t.amount)}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${color}`}>
                        {t.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
              No transactions found.
            </div>
          )}

          {data?.transactions?.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: data.transactions.last_page }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`h-8 w-8 rounded-lg text-sm font-medium ${
                    p === data.transactions.current_page
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WalletView;
