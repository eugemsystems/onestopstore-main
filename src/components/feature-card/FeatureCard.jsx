import React from "react";
import { FiCreditCard, FiGift, FiPhoneCall, FiTruck } from "react-icons/fi";

//internal import

import { cookies } from "next/headers";

const FeatureCard = async ({ storeCustomizationSetting }) => {
  const cookieStore = await cookies();
  const lang = cookieStore.get("_lang")?.value || "en";
  const showingTranslateValue = (data) => {
    if (!data) return "";
    return data !== undefined && Object?.keys(data).includes(lang)
      ? data[lang]
      : data?.en || "";
  };
  const footer = storeCustomizationSetting?.footer;

  const featurePromo = [
    {
      id: 1,
      title: showingTranslateValue(footer?.shipping_card),

      icon: FiTruck,
    },
    {
      id: 2,
      title: showingTranslateValue(footer?.support_card),

      icon: FiPhoneCall,
    },
    {
      id: 3,
      title: showingTranslateValue(footer?.payment_card),
      icon: FiCreditCard,
    },
    {
      id: 4,
      title: showingTranslateValue(footer?.offer_card),
      icon: FiGift,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 mx-auto gap-4">
      {featurePromo.map((promo) => (
        <div
          key={promo.id}
          className="py-3 px-4 flex items-center justify-center bg-card rounded-xl border border-border"
        >
          <div className="mr-3">
            <promo.icon
              className="flex-shrink-0 h-4 w-4 text-primary"
              aria-hidden="true"
            />
          </div>
          <div className="">
            <span className="block text-sm font-medium leading-5">
              {promo?.title}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureCard;
