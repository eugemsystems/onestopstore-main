"use client";

import { CartProvider } from "react-use-cart";
import { ToastContainer } from "react-toastify";
import { SessionProvider } from "next-auth/react";

//internal imports
import { UserProvider } from "@context/UserContext";
import { SidebarProvider } from "@context/SidebarContext";
import { LanguageProvider } from "@context/LanguageContext";
import { WishlistProvider } from "@context/WishlistContext";
import QueryProvider from "@lib/providers/QueryProvider";
import FacebookPixel from "@components/common/FacebookPixel";

// Stripe isn't a real Laravel payment gateway (the valid set is cod,
// bank_transfer, paypal, pese, payfast, pdo_zambia, yoco — verified against
// routes/api.php), so the template's global <Elements> wrapper was dead
// weight: with no publishable key configured, it spammed the console with
// "Expected publishable key to be of type string" on every render.
const Providers = ({ children, storeSetting }) => {
  return (
    <>
      <ToastContainer />
      <FacebookPixel
        pixelId={storeSetting?.fb_pixel_key}
        enabled={storeSetting?.fb_pixel_status}
      />
      <QueryProvider>
        <SessionProvider>
          <LanguageProvider>
            <SidebarProvider>
              <UserProvider>
                <WishlistProvider>
                  <CartProvider>{children}</CartProvider>
                </WishlistProvider>
              </UserProvider>
            </SidebarProvider>
          </LanguageProvider>
        </SessionProvider>
      </QueryProvider>
    </>
  );
};

export default Providers;
