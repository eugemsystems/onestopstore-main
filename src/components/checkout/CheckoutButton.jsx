"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import useTranslation from "next-translate/useTranslation";

//internal imports
import useUtilsFunction from "@hooks/useUtilsFunction";
import { IoArrowForward } from "react-icons/io5";

const CheckoutButton = ({ stripe, isEmpty, storeCustomizationSetting }) => {
  const { t } = useTranslation();
  const { pending } = useFormStatus();
  const { showingTranslateValue } = useUtilsFunction();
  // console.log("pending", pending);
  return (
    <button
      type="submit"
      disabled={isEmpty || pending}
      className="bg-primary hover:bg-primary/90 border cursor-pointer border-primary transition-all rounded-lg py-3 text-center text-sm font-medium text-primary-foreground flex justify-center w-full"
    >
      {pending ? (
        <span className="flex justify-center text-center">
          <img src="/loader/spinner.gif" alt="Loading" width={20} height={10} />
          <span className="ml-2">{t("common:processing")}</span>
        </span>
      ) : (
        <span className="flex justify-center text-center">
          {showingTranslateValue(
            storeCustomizationSetting?.checkout?.confirm_button,
          )}
          <span className="text-xl ml-2">
            {" "}
            <IoArrowForward />
          </span>
        </span>
      )}
    </button>
  );
};

export default CheckoutButton;
