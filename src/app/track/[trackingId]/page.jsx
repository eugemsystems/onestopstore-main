import { trackOrder } from "@lib/actions/tracking.actions";
import TrackingPageClient from "./TrackingPageClient";

export const metadata = {
  title: "Track Your Order",
  description: "Track your order in real-time with our live tracking system.",
};

const TrackOrderPage = async ({ params }) => {
  const { trackingId } = await params;
  const { success, data, error } = await trackOrder(trackingId);

  return (
    <div className="max-w-screen-2xl mx-auto py-10 px-3 sm:px-6">
      <TrackingPageClient
        trackingId={trackingId}
        data={data}
        error={error}
        success={success}
      />
    </div>
  );
};

export default TrackOrderPage;
