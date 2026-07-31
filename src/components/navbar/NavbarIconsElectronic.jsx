"use client";

import {
  ShoppingCartIcon,
  UserIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  StarIcon,
  UserCircleIcon,
  BellIcon,
  KeyIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import { useCart } from "react-use-cart";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

// Internal imports
import CartDrawer from "@components/drawer/CartDrawer";
import { getUserSession } from "@lib/auth-client";
import { isValidImageUrl } from "@utils/imageUtils";

// Existing account pages
const accountMenuItems = [
  { name: "Dashboard",       href: "/user/dashboard",       Icon: Squares2X2Icon },
  { name: "My Orders",       href: "/user/my-orders",       Icon: ClipboardDocumentListIcon },
  { name: "My Reviews",      href: "/user/my-reviews",      Icon: StarIcon },
  { name: "My Account",      href: "/user/my-account",      Icon: UserCircleIcon },
  { name: "Update Profile",  href: "/user/update-profile",  Icon: UserCircleIcon },
  { name: "Notifications",   href: "/user/notifications",   Icon: BellIcon },
  { name: "Change Password", href: "/user/change-password", Icon: KeyIcon },
];

const NavbarIconsElectronic = () => {
  const { totalItems } = useCart();
  const [openCartDrawer, setOpenCartDrawer] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const userInfo = getUserSession();
  const hasValidImage = isValidImageUrl(userInfo?.image);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <>
      <CartDrawer open={openCartDrawer} setOpen={setOpenCartDrawer} />

      <div className="hidden sm:flex items-center gap-1">

        {/* Account — hover dropdown when logged in, direct link when logged out */}
        {userInfo?.email ? (
          <div className="relative group">
            {/* Trigger */}
            <button className="flex items-center gap-1.5 px-2 py-1 rounded-full text-primary-foreground hover:bg-primary-foreground/15 transition-colors">
              {hasValidImage && userInfo?.image ? (
                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-primary-foreground/30">
                  <Image
                    src={userInfo.image}
                    fill
                    className="object-cover"
                    alt={userInfo?.name || "User"}
                  />
                </div>
              ) : (
                <UserIcon className="h-5 w-5 shrink-0" />
              )}
              <div className="flex flex-col leading-none text-left">
                <span className="text-sm font-semibold text-white leading-tight">
                  Hello, {userInfo?.name?.split(" ")[0]}
                </span>
                <span className="text-xs text-white/70 font-medium">Orders & Account</span>
              </div>
              <ChevronDownIcon className="h-3 w-3 text-primary-foreground/70 group-hover:rotate-180 transition-transform duration-200" />
            </button>

            {/* Hover dropdown panel — same pattern as category menu */}
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute right-0 top-full mt-2 z-50 w-64 transition-all duration-200 ease-in-out">
              {/* Triangle arrow — visible above the panel */}
              <div className="absolute -top-2 right-6 h-4 w-4 rotate-45 bg-white  z-10"></div>

              {/* Panel — z-index above arrow */}
              <div className="relative z-20 overflow-hidden rounded-xl bg-white shadow-lg">

                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
                  {hasValidImage && userInfo?.image ? (
                    <Image
                      src={userInfo.image}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                      alt={userInfo?.name || "User"}
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{userInfo?.name || "User"}</div>
                    <div className="text-xs text-gray-500 truncate">{userInfo?.email}</div>
                  </div>
                </div>

                {/* Nav items */}
                <div className="py-1.5">
                  {accountMenuItems.map(({ name, href, Icon }) => (
                    <Link
                      key={name}
                      href={href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <Icon className="h-[18px] w-[18px] text-gray-400 shrink-0" />
                      {name}
                    </Link>
                  ))}
                </div>

                {/* Sign out */}
                <div className="border-t border-gray-100 py-1.5">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <ArrowRightStartOnRectangleIcon className="h-[18px] w-[18px] text-gray-400 shrink-0" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-primary-foreground hover:bg-primary-foreground/15 transition-colors"
          >
            <UserIcon className="h-5 w-5 shrink-0" />
            <div className="flex flex-col leading-none text-left">
              <span className="text-[10px] text-primary-foreground/70">Sign in / Register</span>
              <span className="text-xs font-semibold">Orders & Account</span>
            </div>
          </Link>
        )}

        {/* Cart */}
        <button
          type="button"
          aria-label={isHydrated ? `Cart with ${totalItems} items` : "Cart"}
          onClick={() => setOpenCartDrawer(!openCartDrawer)}
          className="relative p-2 rounded-full text-primary-foreground hover:bg-primary-foreground/15 transition-colors"
        >
          {isHydrated && totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center h-4 w-4 text-[9px] font-bold text-primary bg-primary-foreground rounded-full">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
          <ShoppingCartIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </>
  );
};

export default NavbarIconsElectronic;
