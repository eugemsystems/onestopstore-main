"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowUp, FiArrowDown, FiCalendar } from "react-icons/fi";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { useSetting } from "@context/SettingContext";

const typeColor = (type) => {
  const s = String(type || "").toLowerCase();
  if (["credit", "earned", "reward"].includes(s))
    return { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600", icon: FiArrowUp };
  if (["debit", "redeemed", "used"].includes(s))
    return { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600", icon: FiArrowDown };
  return { bg: "bg-muted", text: "text-muted-foreground", icon: FiArrowUp };
};

const PointsList = ({ data, error }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showDateFormat } = useUtilsFunction();
  const { storeSetting } = useSetting() || {};

  const ratio = Number(storeSetting?.wallet_points?.point_currency_ratio ?? 1) || 1;
  const transactions = data?.transactions?.data || [];

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page);
    router.push(`/user/points?${params.toString()}`);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-5">Reward Points</h2>

      {error ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          {error}
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card p-6 mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-3xl font-bold text-foreground">{data?.balance ?? 0}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              1 Point = {(1 / ratio).toFixed(2)} Balance
            </p>
          </div>

          <h3 className="font-semibold text-foreground mb-3">Transactions</h3>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((t, i) => {
                const c = typeColor(t.type);
                const Icon = c.icon;
                const isDebit = String(t.type).toLowerCase() === "debit";
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${c.bg}`}>
                      <Icon className={c.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{t.detail || "Transaction"}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <FiCalendar size={11} /> {showDateFormat(t.created_at)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-bold ${c.text}`}>
                        {isDebit ? "-" : "+"}
                        {t.amount}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${c.bg} ${c.text}`}>
                        {t.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
              No transactions found. You have not earned any points yet.
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

export default PointsList;
