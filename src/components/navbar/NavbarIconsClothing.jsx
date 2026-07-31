"use client";

import {
  BellIcon,
  ShoppingCartIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import React, { useState, useEffect, Fragment } from "react";
import { useCart } from "react-use-cart";
import Link from "next/link";
import Image from "next/image";
import { Transition, Menu, MenuButton } from "@headlessui/react";

// Internal imports
import CartDrawer from "@components/drawer/CartDrawer";
import { userNavigation } from "@utils/data";
import { getUserSession } from "@lib/auth-client";
import { isValidImageUrl } from "@utils/imageUtils";

const NavbarIconsClothing = () => {
  const { totalItems } = useCart();
  const [openCartDrawer, setOpenCartDrawer] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [mounted, setMounted] = useState(false);

  const userInfo = getUserSession();
  const hasValidImage = isValidImageUrl(userInfo?.image);

  useEffect(() => {
    setMounted(true);
    setIsHydrated(true);
  }, []);

  return (
    <>
      <CartDrawer open={openCartDrawer} setOpen={setOpenCartDrawer} />

      <div className="hidden sm:flex items-center gap-1">
        {/* Cart Icon */}
        <button
          type="button"
          aria-label={isHydrated ? `Cart with ${totalItems} items` : "Cart"}
          onClick={() => setOpenCartDrawer(!openCartDrawer)}
          className="relative p-2 rounded-full text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
        >
          {isHydrated && totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center h-5 w-5 text-[10px] font-bold text-white bg-emerald-500 rounded-full">
              {totalItems}
            </span>
          )}
          <ShoppingCartIcon className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Notification Icon */}
        <Link
          href="/user/notifications"
          aria-label="Notifications"
          className="relative p-2 rounded-full text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
        >
          <BellIcon className="h-5 w-5" aria-hidden="true" />
        </Link>

        {/* Divider */}
        <span className="mx-2 h-5 w-px bg-neutral-700" aria-hidden="true" />

        {/* Profile / Login */}
        <Menu as="div" className="relative">
          {userInfo?.email ? (
            <MenuButton className="flex items-center p-1 rounded-full hover:bg-neutral-800 transition-colors">
              <span className="sr-only">Open user menu</span>
              {hasValidImage ? (
                <Image
                  src={userInfo.image}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full ring-2 ring-neutral-700"
                  alt={userInfo?.name?.[0] || "U"}
                />
              ) : (
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-neutral-800 text-sm font-semibold text-neutral-300">
                  {userInfo?.name?.charAt(0) || "U"}
                </div>
              )}
            </MenuButton>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center p-2 rounded-full text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <span className="sr-only">Login</span>
              <UserIcon className="h-5 w-5" aria-hidden="true" />
            </Link>
          )}

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-lg bg-white dark:bg-neutral-900 py-1.5 shadow-lg ring-1 ring-neutral-200 dark:ring-neutral-700 focus:outline-none">
              {userNavigation.map((item) => (
                <Menu.Item key={item.name}>
                  {({ active }) => (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2 text-sm ${
                        active
                          ? "bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                          : "text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </>
  );
};

export default NavbarIconsClothing;
