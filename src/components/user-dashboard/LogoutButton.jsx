"use client";
import React from "react";

import { FiUnlock } from "react-icons/fi";
import { signOut } from "next-auth/react";

//internal imports
import useUtilsFunction from "@hooks/useUtilsFunction";

const LogoutButton = ({ storeCustomizationSetting }) => {
  const { showingTranslateValue } = useUtilsFunction();
  return (
    <span className="p-2 flex items-center rounded-md hover:bg-muted w-full hover:text-primary">
      <span className="mr-2">
        <FiUnlock />
      </span>{" "}
      <button
        onClick={() => signOut()}
        type="submit"
        className="inline-flex items-center justify-between text-sm font-medium w-full hover:text-primary"
      >
        {showingTranslateValue(storeCustomizationSetting?.navbar?.logout)}
      </button>
    </span>
  );
};

export default LogoutButton;
