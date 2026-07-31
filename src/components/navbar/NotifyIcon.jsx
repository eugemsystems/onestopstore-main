"use client";

import { BellIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { FiHeart, FiRepeat } from "react-icons/fi";
import React, { useState, useEffect } from "react";
import { useCart } from "react-use-cart";
import Link from "next/link";

// Internal imports
import CartDrawer from "@components/drawer/CartDrawer";
import { useWishlist } from "@context/WishlistContext";

const NotifyIcon = () => {
  const { totalItems } = useCart();
  const { wishlistIds, compareIds } = useWishlist();
  const [openCartDrawer, setOpenCartDrawer] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  let [mounted, setMounted] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const res = await fetch("/api/notifications/count");
        if (res.ok) {
          const data = await res.json();
          setNotificationCount(data.unreadCount || 0);
        }
      } catch {
        // silently fail
      }
    };
    fetchNotificationCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <CartDrawer open={openCartDrawer} setOpen={setOpenCartDrawer} />

      <Link
        href="/wishlist"
        aria-label={`Wishlist with ${wishlistIds.length} items`}
        className="relative flex-shrink-0 rounded-full text-primary-foreground/80 p-1 mx-2 hover:text-primary-foreground focus:outline-none"
      >
        {isHydrated && wishlistIds.length > 0 && (
          <span className="absolute z-10 top-0 -right-4 inline-flex items-center justify-center p-1 h-5 w-5 text-xs font-medium leading-none text-red-100 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {wishlistIds.length}
          </span>
        )}
        <FiHeart className="h-6 w-6" aria-hidden="true" />
      </Link>

      <Link
        href="/compare"
        aria-label={`Compare list with ${compareIds.length} items`}
        className="relative flex-shrink-0 rounded-full text-primary-foreground/80 p-1 mx-2 hover:text-primary-foreground focus:outline-none"
      >
        {isHydrated && compareIds.length > 0 && (
          <span className="absolute z-10 top-0 -right-4 inline-flex items-center justify-center p-1 h-5 w-5 text-xs font-medium leading-none text-red-100 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {compareIds.length}
          </span>
        )}
        <FiRepeat className="h-6 w-6" aria-hidden="true" />
      </Link>

      <button
        type="button"
        aria-label={isHydrated ? `Cart with ${totalItems} items` : "Cart"}
        onClick={() => setOpenCartDrawer(!openCartDrawer)}
        className="relative flex-shrink-0 rounded-full text-primary-foreground/80 p-1 mx-2 hover:text-primary-foreground focus:outline-none"
      >
        {isHydrated && totalItems > 0 && (
          <span className="absolute z-10 top-0 -right-4 inline-flex items-center justify-center p-1 h-5 w-5 text-xs font-medium leading-none text-red-100 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {totalItems}
          </span>
        )}
        <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
      </button>
      <Link
        href="/user/notifications"
        aria-label={
          notificationCount > 0
            ? `${notificationCount} unread notifications`
            : "Notifications"
        }
        className="relative flex-shrink-0 rounded-full text-primary-foreground/80 p-1 mx-2 hover:text-primary-foreground focus:outline-none"
      >
        {notificationCount > 0 && (
          <span className="absolute z-10 top-0 -right-4 inline-flex items-center justify-center p-1 h-5 w-5 text-xs font-medium leading-none text-red-100 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {notificationCount > 9 ? "9+" : notificationCount}
          </span>
        )}
        <BellIcon className="h-6 w-6" aria-hidden="true" />
      </Link>
    </>
  );
};

export default NotifyIcon;
