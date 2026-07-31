"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { FiUnlock, FiUser } from "react-icons/fi";
import dynamic from "next/dynamic";

//internal imports
import useUtilsFunction from "@hooks/useUtilsFunction";
import { getUserSession } from "@lib/auth-client";

const LogoutButton = ({ storeCustomization }) => {
  const { showingTranslateValue } = useUtilsFunction();
  const userInfo = getUserSession();
  //   console.log("storeCustomization", storeCustomization);

  return (
    <>
      <Link
        href={`${
          userInfo
            ? "/user/my-account"
            : "/auth/login?redirectUrl=user/my-account"
        }`}
        className="font-medium hover:text-primary"
      >
        {showingTranslateValue(storeCustomization?.navbar?.my_account)}
      </Link>
      <span className="mx-2">|</span>
      {userInfo?.email ? (
        <button
          onClick={() => signOut()}
          type="submit"
          className="flex items-center font-medium hover:text-primary"
        >
          <span className="mr-1">
            <FiUnlock />
          </span>
          {showingTranslateValue(storeCustomization?.navbar?.logout)}
        </button>
      ) : (
        <Link
          href="/auth/login"
          className="flex items-center font-medium hover:text-primary"
        >
          <span className="mr-1">
            <FiUser />
          </span>

          {showingTranslateValue(storeCustomization?.navbar?.login)}
        </Link>
      )}
    </>
  );
};

export default dynamic(() => Promise.resolve(LogoutButton), { ssr: false });
