"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "react-use-cart";
import { FiHome, FiUser, FiShoppingCart, FiAlignLeft } from "react-icons/fi";

//internal imports
import { getUserSession } from "@lib/auth-client";
import PagesDrawer from "@components/drawer/PagesDrawer";
import CartDrawer from "@components/drawer/CartDrawer";

const MobileFooter = ({ globalSetting, categories, categoryError }) => {
  const [openPageDrawer, setOpenPageDrawer] = useState(false);
  const [openCartDrawer, setOpenCartDrawer] = useState(false);
  const { totalItems } = useCart();
  const userInfo = getUserSession();

  return (
    <>
      <CartDrawer open={openCartDrawer} setOpen={setOpenCartDrawer} />

      <div className="flex flex-col h-full justify-between align-middle bg-background rounded cursor-pointer overflow-y-scroll flex-grow scrollbar-hide w-full">
        <PagesDrawer
          open={openPageDrawer}
          setOpen={setOpenPageDrawer}
          categories={categories}
          categoryError={categoryError}
        />
      </div>
      <footer className="sm:hidden fixed z-30 bottom-0 bg-primary flex items-center justify-between w-full h-12 px-3 sm:px-10">
        <button
          aria-label="Bar"
          onClick={() => setOpenPageDrawer(true)}
          className="flex items-center justify-center flex-shrink-0 h-auto relative focus:outline-none"
        >
          <span className="text-xl text-primary-foreground">
            <FiAlignLeft className="w-6 h-6 drop-shadow-xl" />
          </span>
        </button>
        <Link
          href="/"
          className="text-xl text-primary-foreground"
          rel="noreferrer"
          aria-label="Home"
        >
          <FiHome className="w-6 h-6 drop-shadow-xl" />
        </Link>

        <button
          onClick={() => setOpenCartDrawer(!openCartDrawer)}
          className="h-9 w-9 relative whitespace-nowrap inline-flex items-center justify-center text-primary-foreground text-lg"
        >
          <span className="absolute z-10 top-0 right-0 inline-flex items-center justify-center p-1 h-5 w-5 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 bg-red-500 rounded-full">
            {totalItems}
          </span>
          <FiShoppingCart className="w-6 h-6 drop-shadow-xl" />
        </button>

        <button
          aria-label="User"
          type="button"
          className="text-xl text-primary-foreground indicator justify-center"
        >
          {userInfo?.image &&
          (userInfo.image.startsWith("http://") ||
            userInfo.image.startsWith("https://")) ? (
            <Link
              href="/user/dashboard"
              aria-label="user"
              className="relative top-1 w-6 h-6"
            >
              <Image
                width={29}
                height={29}
                src={userInfo.image}
                alt="user"
                className="rounded-full"
              />
            </Link>
          ) : userInfo?.name ? (
            <Link
              aria-label="User"
              href="/user/dashboard"
              className="leading-none font-bold  block"
            >
              {userInfo?.name[0]}
            </Link>
          ) : (
            <Link aria-label="user" href="/auth/login">
              <FiUser className="w-6 h-6 drop-shadow-xl" />
            </Link>
          )}
        </button>
      </footer>
    </>
  );
};

export default dynamic(() => Promise.resolve(MobileFooter), { ssr: false });
