"use client";

import { FiStar } from "react-icons/fi";

/**
 * Big-number rating summary + 5-star breakdown bars — ports the legacy
 * frontend's CustomerReview.jsx rating widget (reviews_avg_rating/rating_count
 * fallback, review_ratings[] histogram) onto this app's design system.
 */
const RatingSummary = ({ product }) => {
  const totalReviews = product?.total_reviews || 0;
  if (!totalReviews) return null;

  const avgRating = parseFloat(product?.average_rating || 0);
  const ratingCounts = product?.raines?.reviewRatings || [0, 0, 0, 0, 0];
  const barColors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

  return (
    <div className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-4xl font-extrabold text-foreground">
          {avgRating.toFixed(2)}
        </span>
        <FiStar className="h-6 w-6 fill-yellow-400 text-yellow-400" />
        <span className="text-sm text-muted-foreground">
          {totalReviews} Rating{totalReviews !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        {ratingCounts
          .map((count, i) => ({ count, star: i + 1 }))
          .reverse()
          .map(({ count, star }) => {
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="flex w-8 shrink-0 items-center gap-0.5 font-medium text-foreground">
                  {star}
                  <FiStar className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, backgroundColor: barColors[star - 1] }}
                  />
                </div>
                <span className="w-5 shrink-0 text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default RatingSummary;
