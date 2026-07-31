"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, Search } from "lucide-react";

const TrackOrderSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trackingId, setTrackingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const presetId = searchParams.get("trackingId");
    if (presetId) {
      setTrackingId(presetId);
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = trackingId.trim();
    if (!id) {
      setError("Please enter a tracking ID");
      return;
    }
    setError("");
    router.push(`/track/${encodeURIComponent(id)}`);
  };

  return (
    <div className="max-w-screen-2xl mx-auto py-16 px-3 sm:px-6">
      <div className="max-w-xl mx-auto text-center">
        <Package className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
        <p className="text-muted-foreground mb-8">
          Enter your tracking ID to see the current status and live tracking of
          your delivery.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={trackingId}
              onChange={(e) => {
                setTrackingId(e.target.value);
                setError("");
              }}
              placeholder="e.g. KB-20250101-A1B2C3"
              className="w-full rounded-lg border border-input bg-background px-4 py-3 pl-11 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Track Order
          </button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          You can find your tracking ID in the order confirmation email. No
          account is required to track your delivery.
        </p>
      </div>
    </div>
  );
};

export default TrackOrderSearch;
