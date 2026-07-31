"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

/**
 * Multi-currency support for the Raines Laravel API.
 * Product prices from the API are always raw USD (see laravelAdapter.js).
 * This context fetches the live currency list (`/currency`), lets the user
 * pick one (persisted in localStorage, mirroring the old frontend's
 * behaviour), and exposes a converter so any component can display the
 * price in the selected currency without re-fetching products.
 */

const DEFAULT_CURRENCY = {
  code: "USD",
  symbol: "$",
  exchange_rate: 1,
  symbol_position: "before_price",
};

const CurrencyContext = createContext({
  currencies: [DEFAULT_CURRENCY],
  selectedCurrency: DEFAULT_CURRENCY,
  setSelectedCurrency: () => {},
  convertPrice: (v) => Number(v || 0),
  formatConverted: (v) => `$${Number(v || 0).toFixed(2)}`,
});

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function CurrencyProvider({ children }) {
  const [currencies, setCurrencies] = useState([DEFAULT_CURRENCY]);
  const [selectedCurrency, setSelectedCurrencyState] =
    useState(DEFAULT_CURRENCY);

  // Load the persisted choice immediately (avoids a flash of USD)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rf_selectedCurrency");
      if (saved) setSelectedCurrencyState(JSON.parse(saved));
    } catch {}
  }, []);

  // Fetch the live currency list once
  useEffect(() => {
    let cancelled = false;
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/currency?paginate=50`, {
      headers: { Accept: "application/json", "Accept-Language": "en" },
    })
      .then((r) => r.json())
      .then((payload) => {
        if (cancelled) return;
        const list = (payload?.data || payload || []).map((c) => ({
          code: c.code,
          symbol: c.symbol,
          exchange_rate: Number(c.exchange_rate) || 1,
          symbol_position: c.symbol_position || "before_price",
          no_of_decimal: c.no_of_decimal ?? 2,
        }));
        if (list.length > 0) {
          setCurrencies(list);
          // Reconcile a persisted currency with the freshest exchange rate
          setSelectedCurrencyState((prev) => {
            const match = list.find((c) => c.code === prev.code);
            return match || list.find((c) => c.code === "USD") || list[0];
          });
        }
      })
      .catch(() => {
        // Network hiccup — keep whatever was loaded from localStorage/default
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setSelectedCurrency = useCallback((currency) => {
    setSelectedCurrencyState(currency);
    try {
      localStorage.setItem("rf_selectedCurrency", JSON.stringify(currency));
    } catch {}
  }, []);

  /** Raw USD product price -> numeric value in the selected currency */
  const convertPrice = useCallback(
    (usdValue) => {
      const rate = Number(selectedCurrency?.exchange_rate) || 1;
      const amount = Number(usdValue || 0) * rate;
      return Number.isFinite(amount) ? amount : 0;
    },
    [selectedCurrency],
  );

  /** Raw USD product price -> formatted string with the selected symbol */
  const formatConverted = useCallback(
    (usdValue) => {
      const amount = convertPrice(usdValue);
      const symbol = selectedCurrency?.symbol || "$";
      const decimals = selectedCurrency?.no_of_decimal ?? 2;
      const text = amount.toFixed(decimals);
      return selectedCurrency?.symbol_position === "after_price"
        ? `${text}${symbol}`
        : `${symbol}${text}`;
    },
    [convertPrice, selectedCurrency],
  );

  return (
    <CurrencyContext.Provider
      value={{
        currencies,
        selectedCurrency,
        setSelectedCurrency,
        convertPrice,
        formatConverted,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}
