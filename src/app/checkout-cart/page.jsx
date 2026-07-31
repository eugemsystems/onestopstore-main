import CheckoutCartScreen from "@components/checkout/CheckoutCartScreen";
import React from "react";

export const metadata = {
  title: "Cart",
  description: "Review your cart items before proceeding to checkout.",
  keywords: ["cart", "shopping cart", "checkout"],
};

const CheckoutCart = async () => {
  return (
    <div className="bg-background min-h-screen">
      <CheckoutCartScreen />
    </div>
  );
};

export default CheckoutCart;
