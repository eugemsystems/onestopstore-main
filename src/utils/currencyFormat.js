/**
 * Currency formatting utilities for the store.
 *
 * Uses Intl.NumberFormat for locale-aware number formatting.
 *
 * IMPORTANT: The locale for number formatting is determined by the
 * UI language (e.g. "en" → "en-US"), NOT by the currency.
 * This ensures Western numerals (0-9) are used when the UI is in English,
 * even if the currency is BDT (৳) or INR (₹).
 * The currency only determines the ISO code for the symbol display.
 */

// Map currency symbols to ISO 4217 codes for Intl.NumberFormat
const symbolToCode = {
  $: "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  A$: "AUD",
  C$: "CAD",
  CHF: "CHF",
  "₹": "INR",
  "৳": "BDT",
  "₨": "PKR",
  R$: "BRL",
  "₩": "KRW",
  MX$: "MXN",
  S$: "SGD",
  HK$: "HKD",
  kr: "SEK",
  NZ$: "NZD",
  R: "ZAR",
  "₽": "RUB",
  "₺": "TRY",
  NT$: "TWD",
  "฿": "THB",
  Rp: "IDR",
  RM: "MYR",
  "₱": "PHP",
  "₫": "VND",
  zł: "PLN",
  Kč: "CZK",
  Ft: "HUF",
  lei: "RON",
  лв: "BGN",
  "Дин.": "RSD",
  kn: "HRK",
  "د.إ": "AED",
  "ر.س": "SAR",
  "د.ك": "KWD",
  "ر.ق": "QAR",
  "ر.ع.": "OMR",
  ".د.ب": "BHD",
  "د.أ": "JOD",
  "ج.م": "EGP",
  "د.ت": "TND",
  "د.م.": "MAD",
  KSh: "KES",
  "₦": "NGN",
  "GH₵": "GHS",
  TSh: "TZS",
  USh: "UGX",
  "₸": "KZT",
  "₼": "AZN",
  "₾": "GEL",
};

// Map language codes to locale strings for number formatting
const langToLocale = {
  en: "en-US",
  bn: "bn-BD",
  ar: "ar-SA",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
  pt: "pt-BR",
  hi: "hi-IN",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
  ru: "ru-RU",
  tr: "tr-TR",
  it: "it-IT",
  nl: "nl-NL",
  pl: "pl-PL",
  th: "th-TH",
  vi: "vi-VN",
  id: "id-ID",
  ms: "ms-MY",
  sv: "sv-SE",
  da: "da-DK",
  nb: "no-NO",
  fi: "fi-FI",
};

/**
 * Get the ISO currency code from a currency symbol.
 */
export function getCurrencyCode(symbol) {
  if (!symbol) return "USD";
  return symbolToCode[symbol] || "USD";
}

/**
 * Get the locale string from a language code.
 */
export function getLocale(lang) {
  if (!lang) return "en-US";
  return langToLocale[lang] || "en-US";
}

/**
 * Format a price value with proper currency formatting.
 *
 * The LOCALE (which controls numeral system: 0-9 vs ০-৯) is determined
 * by the UI language, NOT the currency. So if lang="en" and currency="৳",
 * you get "৳90.78" (Western numerals), not "৯০.৭৮৳" (Bengali numerals).
 *
 * @param {number} value - The numeric value to format
 * @param {string} currencySymbol - The currency symbol (e.g., "$", "৳", "€")
 * @param {string} lang - UI language code (e.g., "en", "bn")
 * @returns {string} Formatted price string
 */
export function formatPrice(value, currencySymbol = "$", lang = "en") {
  const num = Number(parseFloat(value || 0).toFixed(2));
  const currencyCode = getCurrencyCode(currencySymbol);
  // Use the UI language locale — NOT the currency's native locale
  const locale = getLocale(lang);

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    // Fallback: manual formatting if Intl fails
    return `${currencySymbol}${num.toFixed(2)}`;
  }
}

/**
 * Format a number value using locale-aware formatting (no currency symbol).
 *
 * @param {number} value - The numeric value to format
 * @param {string} lang - UI language code (e.g., "en", "bn")
 * @returns {string} Formatted number string
 */
export function formatNumber(value, lang = "en") {
  const num = Number(parseFloat(value || 0).toFixed(2));
  // Use the UI language locale for numeral formatting
  const locale = getLocale(lang);

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return num.toFixed(2);
  }
}
