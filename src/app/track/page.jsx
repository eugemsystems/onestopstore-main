import { Suspense } from "react";
import TrackOrderSearch from "./TrackOrderSearch";

export const metadata = {
  title: "Track Your Order",
  description:
    "Enter your tracking ID to track your order status in real-time.",
};

const TrackPage = () => {
  return (
    <Suspense
      fallback={
        <div className="max-w-screen-2xl mx-auto py-16 px-3 sm:px-6 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
        </div>
      }
    >
      <TrackOrderSearch />
    </Suspense>
  );
};

export default TrackPage;
