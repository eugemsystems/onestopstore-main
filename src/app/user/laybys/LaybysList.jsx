"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiCalendar, FiChevronRight } from "react-icons/fi";
import useUtilsFunction from "@hooks/useUtilsFunction";

const statusColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (["completed", "complete"].includes(s)) return "bg-emerald-50 text-emerald-600 border-emerald-200";
  if (["active", "approved"].includes(s)) return "bg-blue-50 text-blue-600 border-blue-200";
  if (s === "pending") return "bg-amber-50 text-amber-600 border-amber-200";
  if (["rejected", "cancelled"].includes(s)) return "bg-red-50 text-red-600 border-red-200";
  return "bg-muted text-muted-foreground border-border";
};

const LaybysList = ({ data, error }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice, showDateFormat } = useUtilsFunction();
  const applications = data?.data || [];

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page);
    router.push(`/user/laybys?${params.toString()}`);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-5">My Laybys</h2>

      {error ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          {error}
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map((app) => {
            const progress = Math.round(
              (Number(app.total_paid || 0) / Number(app.total_amount || 1)) * 100,
            );
            const thumbUrl = app.product?.product_thumbnail?.image_url;
            return (
              <Link
                key={app.id}
                href={`/user/laybys/${app.id}`}
                className="block rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-14 w-14 shrink-0 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                      {thumbUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumbUrl} alt={app.product_name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">LB</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-foreground">
                          {app.application_number}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize ${statusColor(app.status)}`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{app.product_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <FiCalendar size={11} /> {showDateFormat(app.created_at)} •{" "}
                        {app.duration_months} months
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-foreground">{formatPrice(app.total_amount)}</span>
                    <FiChevronRight className="text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/40 border-t border-border">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${progress === 100 ? "bg-emerald-500" : "bg-primary"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{progress}%</span>
                  <span className="text-xs text-emerald-600 font-medium">
                    Paid {formatPrice(app.total_paid)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Bal: {formatPrice(app.balance_remaining)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          You haven't applied for any laybys yet. Browse eligible products to see layby options.
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

export default LaybysList;
