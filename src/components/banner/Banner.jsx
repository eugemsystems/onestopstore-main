import React from "react";
import Link from "next/link";

//internal import

import { getStoreCustomizationSetting } from "@services/SettingServices";
import { showingTranslateValue } from "@lib/translate";
import PromoBannerButton from "@components/banner/PromoBannerButton";

const Banner = async ({}) => {
  const { storeCustomizationSetting, error } =
    await getStoreCustomizationSetting();
  const home = storeCustomizationSetting?.home;

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h1 className=" text-xl">
            <span className="text-primary dark:text-muted-foreground font-bold">
              {showingTranslateValue(home?.promotion_title)}
            </span>{" "}
          </h1>

          <p className="text-muted-foreground dark:text-muted-foreground">
            {showingTranslateValue(home?.promotion_description)}
          </p>
        </div>
        <PromoBannerButton
          href={home?.promotion_button_link}
          label={showingTranslateValue(home?.promotion_button_name)}
        />
      </div>
    </>
  );
};

export default Banner;
