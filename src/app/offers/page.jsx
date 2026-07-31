import React from "react";

//internal imports
import Coupon from "@components/coupon/Coupon";
import PageHeader from "@components/header/PageHeader";
import { getCustomizationSettings } from "@lib/actions/settings.actions";

export const metadata = {
  title: "Offers",
  description:
    "Discover the latest offers, discounts, and deals available at our store.",
  keywords: ["offers", "discounts", "promotions", "sales"],
};

const Offers = async () => {
  const { storeCustomizationSetting } = await getCustomizationSettings();
  return (
    <div className="bg-background">
      <PageHeader
        headerBg={storeCustomizationSetting?.offers?.header_bg}
        title={storeCustomizationSetting?.offers?.title}
      />

      <div className="relative z-10 -mt-4 sm:-mt-6 mx-auto max-w-screen-2xl px-4 py-10 lg:py-20 sm:px-10">
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
          <Coupon />
        </div>
      </div>
    </div>
  );
};

export default Offers;
