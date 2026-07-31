"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { IoReturnUpBackOutline } from "react-icons/io5";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCart } from "react-use-cart";
import { getUserSession } from "@lib/auth-client";

//internal import

import CartItem from "@components/cart/CartItem";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { useSetting } from "@context/SettingContext";

const CheckoutCartScreen = () => {
  const router = useRouter();
  const userInfo = getUserSession();
  const { storeCustomization } = useSetting();
  const { showingTranslateValue, formatPrice } = useUtilsFunction();
  const { isEmpty, items, cartTotal } = useCart();

  const checkout = storeCustomization?.checkout;

  const handleCheckout = () => {
    if (items?.length <= 0) {
      return;
    }
    // Guest checkout isn't supported by the Laravel API (or the legacy
    // frontend) — always require login before checkout.
    router.push(userInfo ? "/checkout" : "/auth/login?redirectUrl=/checkout");
  };

  return (
    <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 pt-10 pb-16">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">
        <div className="w-full lg:w-[60%] xl:w-[55%]">
          <h2 className="font-bold text-xl pb-4 text-foreground">
            Shopping Cart
          </h2>
          <div className="w-full block bg-card rounded-xl border border-border p-4 sm:p-6">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}

            {isEmpty && (
              <div className="mt-10 flex flex-col h-full justify-center">
                <div className="flex flex-col items-center">
                  <Image
                    className="size-40 flex-none rounded-md object-cover"
                    src="/no-result.svg"
                    alt="no-result"
                    width={400}
                    height={380}
                  />
                  <h3 className=" font-semibold text-muted-foreground text-lg pt-5">
                    Your cart is empty
                  </h3>
                  <p className="px-12 text-center text-sm text-muted-foreground pt-2">
                    No items added in your cart. Please add product to your cart
                    list.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="hidden lg:block border-l border-border mx-10 xl:mx-16 2xl:mx-20 shrink-0"></div>
        <div className="flex-1">
          <div className="sticky top-44 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-8">
              <h2 className="font-semibold text-lg">
                {showingTranslateValue(checkout?.order_summary)}
              </h2>

              <div className="mt-3 text-sm text-muted-foreground dark:text-muted-foreground">
                <div className="flex justify-between py-3 border-b border-border/70 dark:border-border">
                  <span className="font-semibold text-muted-foreground">
                    {showingTranslateValue(checkout?.sub_total)}
                  </span>
                  <span className="font-semibold text-foreground dark:text-muted-foreground">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-muted/40 p-8 rounded-b-xl border-t border-border">
              <p className="flex justify-between font-semibold text-foreground">
                <span>
                  <span className="text-sm">
                    {showingTranslateValue(checkout?.total_cost)}
                  </span>
                  <span className="block text-sm text-muted-foreground font-normal">
                    Shipping and taxes calculated at checkout.
                  </span>
                </span>
                <span className="font-bold text-foreground text-lg">
                  {formatPrice(cartTotal)}
                </span>
              </p>

              <div className="flex space-x-3 items-center mt-6">
                <Link
                  href="/"
                  className="relative h-auto inline-flex items-center justify-center rounded-lg transition-colors text-xs sm:text-base font-medium py-2.5 px-3 bg-background text-foreground hover:bg-muted flex-1 border border-border"
                >
                  <span className="text-xl mr-2">
                    <IoReturnUpBackOutline />
                  </span>
                  {showingTranslateValue(checkout?.continue_button)}
                </Link>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="relative h-auto inline-flex items-center justify-center rounded-lg w-full transition-colors text-xs sm:text-base font-medium py-2.5 px-3 bg-primary hover:bg-primary/90 text-primary-foreground flex-1 focus:outline-none"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(CheckoutCartScreen), {
  ssr: false,
});
