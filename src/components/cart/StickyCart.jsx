"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import { IoBagHandleOutline } from "react-icons/io5";
import { useCart } from "react-use-cart";

//internal import
import CartDrawer from "@components/drawer/CartDrawer";
import useUtilsFunction from "@hooks/useUtilsFunction";

const StickyCart = () => {
  const { totalItems, cartTotal } = useCart();
  const [openCartDrawer, setOpenCartDrawer] = useState(false);
  const { formatPrice } = useUtilsFunction();

  // Animation states
  const [animateCount, setAnimateCount] = useState(false);
  const [animatePrice, setAnimatePrice] = useState(false);

  // Track previous values
  const [prevItems, setPrevItems] = useState(totalItems);
  const [prevTotal, setPrevTotal] = useState(cartTotal);

  React.useEffect(() => {
    if (totalItems > prevItems) {
      setAnimateCount(true);
      const timer = setTimeout(() => setAnimateCount(false), 800);
      setPrevItems(totalItems);
      return () => clearTimeout(timer);
    }
    setPrevItems(totalItems);
  }, [totalItems, prevItems]);

  React.useEffect(() => {
    if (cartTotal > prevTotal) {
      setAnimatePrice(true);
      const timer = setTimeout(() => setAnimatePrice(false), 800);
      setPrevTotal(cartTotal);
      return () => clearTimeout(timer);
    }
    setPrevTotal(cartTotal);
  }, [cartTotal, prevTotal]);

  return (
    <>
      <style>{`
        @keyframes cartPop {
          0% { transform: scale(1); }
          30% { transform: scale(1.4); }
          50% { transform: scale(0.9); }
          75% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes priceGlow {
          0% { transform: scale(1); filter: brightness(1); }
          30% { transform: scale(1.2); filter: brightness(1.3); color: #facc15; }
          100% { transform: scale(1); filter: brightness(1); }
        }
        .animate-cart-pop {
          animation: cartPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .animate-price-glow {
          animation: priceGlow 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
      <CartDrawer open={openCartDrawer} setOpen={setOpenCartDrawer} />
      {!openCartDrawer && (
        <button
          aria-label="Cart"
          onClick={() => setOpenCartDrawer(!openCartDrawer)}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center justify-center w-16 h-16 dark:from-emerald-600 dark:to-teal-700 text-white hover:scale-110 transition-all duration-300 ease-out rounded-full group cursor-pointer"
        >
          {/* Bag Icon */}
          <span className="text-4xl mb-1 text-primary group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
            <IoBagHandleOutline />
          </span>

          {/* Price inside the icon circle */}
          <span className={`text-[10px] font-bold tracking-wide bg-primary dark:bg-black/35 px-2 py-1 rounded-full -mt-2 z-0 shadow-sm border border-white/15 ${animatePrice ? "animate-price-glow" : ""}`}>
            {formatPrice(cartTotal)}
          </span>

          {/* Cart Quantity Badge */}
          {totalItems > 0 && (
            <span className={`absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 border-1 border-background text-[10px] font-bold text-white shadow-md ${animateCount ? "animate-cart-pop" : ""}`}>
              {totalItems}
            </span>
          )}
        </button>
      )}
    </>
  );
};

export default dynamic(() => Promise.resolve(StickyCart), { ssr: false });
