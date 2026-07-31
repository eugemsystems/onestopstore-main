import { getLaybyAction } from "@lib/actions/account-extras.actions";
import { getStoreSettings } from "@lib/actions/settings.actions";
import LaybyDetailView from "./LaybyDetailView";

export const metadata = {
  title: "Layby Details",
};

const LaybyDetailPage = async ({ params }) => {
  const { id } = await params;
  const [{ data, error }, { storeSetting }] = await Promise.all([
    getLaybyAction(id),
    getStoreSettings(),
  ]);

  return (
    <div className="overflow-hidden">
      <LaybyDetailView application={data} error={error} paymentMethods={storeSetting?.payment_methods} />
    </div>
  );
};

export default LaybyDetailPage;
