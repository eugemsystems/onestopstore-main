"use client";

import dayjs from "dayjs";
import { useSetting } from "@context/SettingContext";
import { useLanguage } from "@context/LanguageContext";
import { useCurrency } from "@context/CurrencyContext";
import {
  formatPrice as formatPriceFn,
  formatNumber as formatNumberFn,
} from "@utils/currencyFormat";

const useUtilsFunction = () => {
  const { lang } = useLanguage();
  const settingCtx = useSetting();
  const globalSetting = settingCtx?.globalSetting;
  const { selectedCurrency, convertPrice } = useCurrency();

  const currency = globalSetting?.default_currency || "$";

  //for date and time format
  const showTimeFormat = (data, timeFormat) => {
    return dayjs(data).format(timeFormat);
  };

  const showDateFormat = (data) => {
    return dayjs(data).format("DD MMM, YYYY, h:aa A");
  };

  const showDateTimeFormat = (data, date, time) => {
    return dayjs(data).format(`${date} ${time}`);
  };

  //for formatting number

  const getNumber = (value = 0) => {
    return Number(parseFloat(value || 0).toFixed(2));
  };

  const getNumberTwo = (value = 0) => {
    return parseFloat(value || 0).toFixed(2);
  };

  /**
   * Format a price with Intl locale-aware currency formatting.
   * Product/cart/checkout prices from the Raines API are always raw USD,
   * so this converts to the user's selected currency (see CurrencyContext)
   * before formatting. NOTE: do not use this for historical order/invoice
   * amounts that were already charged in a specific currency — those must
   * render as-is (see components/invoice/*, which format directly).
   */
  const formatPrice = (value, customCurrency) => {
    const converted = convertPrice(value);
    const sym = customCurrency || selectedCurrency?.symbol || currency;
    return formatPriceFn(converted, sym, lang);
  };

  /**
   * Format a number with locale-aware formatting (no currency symbol).
   */
  const formatNumber = (value) => {
    return formatNumberFn(value, lang);
  };

  //for translation
  const showingTranslateValue = (data) => {
    return data !== undefined && Object?.keys(data).includes(lang)
      ? data[lang]
      : data?.en;
  };

  const showingImage = (data) => {
    return data !== undefined && data;
  };

  const showingUrl = (data) => {
    return data !== undefined ? data : "!#";
  };

  return {
    lang,
    currency,
    getNumber,
    getNumberTwo,
    formatPrice,
    formatNumber,
    showTimeFormat,
    showDateFormat,
    showingImage,
    showingUrl,
    showDateTimeFormat,
    showingTranslateValue,
  };
};

export default useUtilsFunction;
