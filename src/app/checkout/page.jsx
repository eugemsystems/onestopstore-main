import { Suspense } from "react";

// Server Actions from lib
import {
  listAddressBook,
  listAddressCountries,
  getWalletPointsBalance,
} from "@lib/actions/customer.actions";
import {
  getCustomizationSettings,
  getStoreSettings,
} from "@lib/actions/settings.actions";

// Client Component
import CheckoutClient from "./_components/checkout-client";
import CheckoutLoading from "./loading";

// Always render fresh — the checkout page should never be statically cached
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout",
  description:
    "Complete your purchase securely and quickly with our checkout process.",
  keywords: ["checkout", "payment", "shipping", "order", "secure checkout"],
};

const Checkout = async () => {
  // proxy.js already redirects unauthenticated visitors to /auth/login
  // before this ever renders (guest checkout isn't supported by the
  // Laravel API, matching the legacy frontend).

  const [
    { storeCustomizationSetting, error: customizationError },
    { storeSetting, error: storeError },
    { addresses, error: addressError },
    { countries, error: countryError },
    { wallet, point },
  ] = await Promise.all([
    getCustomizationSettings(),
    getStoreSettings(),
    listAddressBook(),
    listAddressCountries(),
    getWalletPointsBalance(),
  ]);

  const error = customizationError || storeError || addressError || countryError;

  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutClient
        error={error}
        storeSetting={storeSetting}
        addresses={addresses}
        countries={countries}
        wallet={wallet}
        point={point}
        storeCustomizationSetting={storeCustomizationSetting}
      />
    </Suspense>
  );
};

export default Checkout;
