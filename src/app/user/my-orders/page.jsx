import React from "react";

//internal imports
import { getCustomerOrders } from "@lib/actions/order.actions";
import RecentOrder from "@components/order/RecentOrder";
import { getCustomizationSettings } from "@lib/actions/settings.actions";

const MyOrders = async ({ searchParams }) => {
  const { storeCustomizationSetting } = await getCustomizationSettings();

  const { page } = await searchParams;

  const dashboard = storeCustomizationSetting?.dashboard;

  const { data, error } = await getCustomerOrders({
    page: Number(page || 1),
    limit: 10,
  });

  // console.log("dashboard", dashboard);

  return (
    <div className="overflow-hidden">
      <RecentOrder link data={data} error={error} title={dashboard?.my_order} />
    </div>
  );
};

export default MyOrders;
