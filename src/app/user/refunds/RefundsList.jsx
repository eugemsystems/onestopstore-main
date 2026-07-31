"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FiCalendar, FiRotateCcw } from "react-icons/fi";
import useUtilsFunction from "@hooks/useUtilsFunction";

const statusColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (["approved", "completed", "refunded"].includes(s)) return "bg-emerald-50 text-emerald-600 border-emerald-200";
  if (["pending", "processing"].includes(s)) return "bg-amber-50 text-amber-600 border-amber-200";
  if (["rejected", "declined", "cancelled"].includes(s)) return "bg-red-50 text-red-600 border-red-200";
  return "bg-muted text-muted-foreground border-border";
};

const RefundsList = ({ data, error }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showDateFormat } = useUtilsFunction();
  const refunds = data?.data || [];

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page);
    router.push(`/user/refunds?${params.toString()}`);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-5">My Refunds</h2>

      {error ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          {error}
        </div>
      ) : refunds.length > 0 ? (
        <div className="space-y-3">
          {refunds.map((refund, i) => (
            <div key={refund.id || i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                <FiRotateCcw className="text-amber-600" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-foreground">
                    Order #{refund?.order?.order_number}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize ${statusColor(refund.status)}`}>
                    {refund.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                  {refund?.reason || "No reason provided"}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <FiCalendar size={11} /> {showDateFormat(refund?.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          You have no refunds processed yet.
        </div>
      )}

      {data?.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: data.last_page }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`h-8 w-8 rounded-lg text-sm font-medium ${
                p === data.current_page
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RefundsList;
