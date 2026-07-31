"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { rateDeliveryBoy } from "@lib/actions/tracking.actions";

const RateDelivery = ({ orderId, existingRating }) => {
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState(existingRating?.review || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingRating?.rating);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await rateDeliveryBoy({
        orderId,
        rating,
        review,
      });

      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || "Failed to submit rating");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          <h4 className="font-semibold text-green-700 dark:text-green-400">
            Delivery Rated
          </h4>
        </div>
        <div className="flex items-center gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= rating
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-sm font-medium ml-1">{rating}/5</span>
        </div>
        {review && (
          <p className="text-sm text-muted-foreground italic">"{review}"</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Star className="h-5 w-5 text-yellow-500" />
        Rate Your Delivery Experience
      </h4>

      <form onSubmit={handleSubmit}>
        {/* Stars */}
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`h-7 w-7 cursor-pointer transition-colors ${
                  star <= (hoverRating || rating)
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm text-muted-foreground ml-2">
              {rating === 1
                ? "Poor"
                : rating === 2
                  ? "Fair"
                  : rating === 3
                    ? "Good"
                    : rating === 4
                      ? "Very Good"
                      : "Excellent"}
            </span>
          )}
        </div>

        {/* Review textarea */}
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your delivery experience (optional)..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          rows={3}
        />

        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="mt-3 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Submitting..." : "Submit Rating"}
        </button>
      </form>
    </div>
  );
};

export default RateDelivery;
