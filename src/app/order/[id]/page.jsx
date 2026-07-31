import Sidebar from "@components/user-dashboard/Sidebar";
import { getOrderById } from "@lib/actions/order.actions";
import { getStoreSettings } from "@lib/actions/settings.actions";
import OrderDetailView from "./_components/OrderDetailView";

const Order = async ({ params, searchParams }) => {
  const { id } = await params;
  const sp = await searchParams;
  const { order, error } = await getOrderById(id);
  const { storeSetting } = await getStoreSettings();

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 py-6 lg:py-10">
        <div className="flex flex-col lg:flex-row w-full gap-6 lg:gap-0">
          <div className="flex-shrink-0 w-full lg:w-80 mr-0 lg:mr-10 xl:mr-10">
            <Sidebar />
          </div>
          <div className="w-full overflow-hidden">
            <OrderDetailView
              orderId={id}
              order={order}
              error={error}
              paymentMethods={storeSetting?.payment_methods || []}
              statusParam={(sp?.status || "").toLowerCase()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
