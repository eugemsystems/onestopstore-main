"use client";

import React from "react";
import { useCurrency } from "@context/CurrencyContext";

/**
 * Currency switcher — mirrors SelectLanguage.jsx's hover-dropdown pattern.
 * Reads the live currency list from the Raines Laravel API (via
 * CurrencyContext) and persists the shopper's choice to localStorage.
 */
const SelectCurrency = ({ size = "text-sm" }) => {
  const { currencies, selectedCurrency, setSelectedCurrency } = useCurrency();

  if (!currencies || currencies.length <= 1) return null;

  return (
    <div className="relative group">
      <button className={`flex items-center justify-center ${size}`}>
        <span className="font-medium hover:text-primary items-center flex gap-1">
          <span>{selectedCurrency?.code || "USD"}</span>
          <svg
            className="ml-0.5 h-3 w-3 group-hover:rotate-180 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute right-0 top-full pt-2 z-50 transition-all duration-200 ease-in-out">
        <div className="w-36 origin-top-right rounded-lg bg-card py-2 shadow-xl ring-1 ring-border">
          {currencies.map((c) => (
            <div key={c.code} className="px-3 py-1 hover:bg-accent">
              <button
                onClick={() => setSelectedCurrency(c)}
                className={`w-full flex justify-between gap-3 px-3 py-0.5 text-sm leading-6 hover:text-primary ${
                  c.code === selectedCurrency?.code
                    ? "text-primary font-semibold"
                    : "text-foreground"
                }`}
              >
                <span>{c.code}</span>
                <span>{c.symbol}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectCurrency;
