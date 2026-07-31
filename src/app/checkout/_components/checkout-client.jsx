"use client";

import CheckoutForm from "@components/checkout/CheckoutForm";

export default function CheckoutClient({
  error,
  storeSetting,
  addresses,
  countries,
  wallet,
  point,
  storeCustomizationSetting,
}) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md w-full text-center">
          <svg
            className="w-12 h-12 text-red-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
            Checkout Error
          </h3>
          <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <CheckoutForm
          storeSetting={storeSetting}
          addresses={addresses}
          countries={countries}
          wallet={wallet}
          point={point}
          storeCustomizationSetting={storeCustomizationSetting}
        />
      </div>
    </div>
  );
}
