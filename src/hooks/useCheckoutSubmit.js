"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "react-use-cart";

//internal import

import { notifyError, notifySuccess } from "@utils/toast";
import { addNotification } from "@services/NotificationServices";
import {
  addOrder,
  previewCheckoutTotals,
  sendEmailInvoiceToCustomer,
} from "@services/OrderServices";
import { getUserSession } from "@lib/auth-client";
import { useSetting } from "@context/SettingContext";
import useUtilsFunction from "./useUtilsFunction";

/**
 * Full checkout flow, mirroring legacy's Checkout/index.jsx +
 * CheckoutSidebar/index.jsx: separate billing/shipping addresses, a
 * delivery option, a payment gateway, an order note, optional wallet/points
 * redemption, and a coupon — with live authoritative totals recomputed on
 * every change via Laravel's /checkout endpoint (safe now that addresses are
 * picked from the real address book instead of resolved from free text).
 */
const useCheckoutSubmit = ({ addresses: initialAddresses, wallet, point }) => {
  const [addresses, setAddresses] = useState(initialAddresses || []);
  const [billingAddressId, setBillingAddressId] = useState(
    initialAddresses?.[0]?.id ?? null,
  );
  const [shippingAddressId, setShippingAddressId] = useState(
    initialAddresses?.[0]?.id ?? null,
  );
  const [deliveryOption, setDeliveryOption] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [note, setNote] = useState("");
  const [useWallet, setUseWallet] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponInfo, setCouponInfo] = useState({});
  const [isCouponAvailable, setIsCouponAvailable] = useState(false);

  const [totals, setTotals] = useState({});
  const [totalsError, setTotalsError] = useState("");
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  const router = useRouter();
  const couponRef = useRef("");
  const { isEmpty, emptyCart, items, cartTotal } = useCart();

  const userInfo = getUserSession();
  const { globalSetting, storeSetting, storeCustomization } = useSetting();
  const { showDateFormat, showingTranslateValue } = useUtilsFunction();

  const currency = globalSetting?.default_currency || "$";

  const availableWallet = Number(wallet?.balance ?? 0) + Number(wallet?.non_cashable_balance ?? 0);
  const availablePoints = Number(point?.balance ?? 0);
  const ratio = Number(storeSetting?.wallet_points?.point_currency_ratio ?? 1) || 1;
  const pointsValue = availablePoints / ratio;

  const canUseWallet = availableWallet > 0;
  const canUsePoints = availablePoints > 0;

  const buildOrderInfo = () => ({
    consumer_id: userInfo?.id,
    billing_address_id: billingAddressId,
    shipping_address_id: shippingAddressId,
    shippingOption: deliveryOption?.title || "Standard Delivery",
    delivery_price: Number(deliveryOption?.price ?? 0),
    paymentMethod,
    coupon_code: couponInfo?.couponCode || "",
    points_amount: usePoints,
    wallet_balance: useWallet,
    note,
    cart: items,
  });

  // Live totals: recompute from Laravel's authoritative /checkout endpoint
  // whenever any pricing-relevant selection changes.
  useEffect(() => {
    if (!billingAddressId || !shippingAddressId || isEmpty) {
      setTotals({});
      return;
    }
    let cancelled = false;
    (async () => {
      const { totals: t, error } = await previewCheckoutTotals(buildOrderInfo());
      if (cancelled) return;
      if (error) {
        setTotalsError(error);
        setTotals({});
      } else {
        setTotalsError("");
        setTotals(t || {});
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    billingAddressId,
    shippingAddressId,
    deliveryOption?.title,
    deliveryOption?.price,
    paymentMethod,
    useWallet,
    usePoints,
    couponInfo?.couponCode,
    items.length,
    cartTotal,
  ]);

  const subTotal = Number(totals.sub_total ?? cartTotal ?? 0);
  const shippingTotal = Number(totals.shipping_total ?? 0);
  const taxTotal = Number(totals.tax_total ?? 0);
  const deliveryPrice = Number(totals.delivery_price ?? deliveryOption?.price ?? 0);
  const couponDiscount = Math.max(0, Math.abs(Number(totals.coupon_total_discount ?? 0)));

  // Laravel's /checkout totals response does not echo back a wallet/points
  // deduction amount, so — same as the legacy frontend's CheckoutSidebar —
  // wallet and points redemption is computed client-side against the
  // account's known balances, capped so it can never exceed what's owed.
  const baseTotal = subTotal + shippingTotal + taxTotal + deliveryPrice;
  const maxAfterCoupon = Math.max(0, baseTotal - couponDiscount);
  const pointsApplied = usePoints ? Math.min(pointsValue, maxAfterCoupon) : 0;
  const totalAfterPoints = Math.max(0, maxAfterCoupon - pointsApplied);
  const walletApplied = useWallet ? Math.min(availableWallet, totalAfterPoints) : 0;
  const total = Math.max(0, totalAfterPoints - walletApplied);

  const handleAddressCreated = (address) => {
    setAddresses((prev) => [...prev, address]);
  };

  const handleCouponCode = async (e) => {
    e.preventDefault();
    const code = couponRef.current?.value?.trim();
    if (!code) {
      notifyError("Please Input a Coupon Code!");
      return;
    }
    if (!billingAddressId || !shippingAddressId) {
      notifyError("Please choose a billing and shipping address first.");
      return;
    }

    setIsCouponAvailable(true);
    try {
      const { totals: t, error } = await previewCheckoutTotals({
        ...buildOrderInfo(),
        coupon_code: code,
      });

      if (error || !t) {
        notifyError(error || "This coupon could not be applied.");
        return;
      }

      const discount = Math.max(0, Math.abs(Number(t.coupon_total_discount ?? 0)));
      if (discount <= 0) {
        notifyError("This coupon is not valid for your cart.");
        return;
      }

      setCouponInfo({ couponCode: code });
      notifySuccess(`Your Coupon ${code} is Applied!`);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setIsCouponAvailable(false);
    }
  };

  const removeCoupon = () => setCouponInfo({});

  const submitHandler = async (e) => {
    e?.preventDefault?.();

    if (!billingAddressId || !shippingAddressId) {
      notifyError("Please choose a billing and shipping address.");
      return;
    }
    if (!deliveryOption) {
      notifyError("Please choose a shipping option.");
      return;
    }
    if (!paymentMethod) {
      notifyError("Please choose a payment method.");
      return;
    }

    try {
      setIsCheckoutSubmit(true);

      const { orderResponse, error: orderError } = await addOrder(buildOrderInfo());

      if (orderError) {
        setIsCheckoutSubmit(false);
        return notifyError(orderError);
      }
      if (!orderResponse) {
        setIsCheckoutSubmit(false);
        return notifyError("Order response is empty!");
      }

      const redirectUrl =
        orderResponse?.payment_url ||
        orderResponse?.redirect_url ||
        orderResponse?.url;

      if (redirectUrl) {
        Cookies.remove("couponInfo");
        emptyCart();
        window.location.href = redirectUrl;
        return;
      }

      await handleOrderSuccess(orderResponse);
    } catch (error) {
      notifyError(error?.response?.data?.message || error?.message);
      setIsCheckoutSubmit(false);
    }
  };

  const handleOrderSuccess = async (orderResponse) => {
    try {
      const notificationInfo = {
        orderId: orderResponse?._id,
        message: `${
          orderResponse?.user_info?.name
        } placed an order of ${parseFloat(orderResponse?.total).toFixed(2)}!`,
        image:
          userInfo?.image ||
          "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png",
      };

      const updatedData = {
        ...orderResponse,
        date: showDateFormat(orderResponse.createdAt),
        company_info: {
          currency,
          vat_number: globalSetting?.vat_number,
          company: globalSetting?.company_name,
          address: globalSetting?.address,
          phone: globalSetting?.contact,
          email: globalSetting?.email,
          website: globalSetting?.website,
          from_email: globalSetting?.from_email,
        },
      };

      if (globalSetting?.email_to_customer) {
        sendEmailInvoiceToCustomer(updatedData).catch((emailErr) => {
          console.error("Failed to send email invoice:", emailErr.message);
        });
      }

      await addNotification(notificationInfo);

      setOrderSuccessData({
        orderId: orderResponse?._id,
        invoice: orderResponse?.invoice,
        total: orderResponse?.total,
        trackingId: orderResponse?.trackingId,
        currency,
      });
      setShowOrderSuccess(true);

      router.push(`/order/${orderResponse?._id}`);
      notifySuccess(
        "Your Order Confirmed! The invoice will be emailed to you shortly.",
      );
      Cookies.remove("couponInfo");
      emptyCart();
      setIsCheckoutSubmit(false);
    } catch (err) {
      console.error("Order success handling error:", err.message);
      throw new Error(err.message);
    }
  };

  return {
    addresses,
    billingAddressId,
    setBillingAddressId,
    shippingAddressId,
    setShippingAddressId,
    handleAddressCreated,
    deliveryOption,
    setDeliveryOption,
    paymentMethod,
    setPaymentMethod,
    note,
    setNote,
    useWallet,
    setUseWallet,
    usePoints,
    setUsePoints,
    canUseWallet,
    canUsePoints,
    availableWallet,
    availablePoints,
    pointsValue,
    couponInfo,
    couponRef,
    handleCouponCode,
    removeCoupon,
    isCouponAvailable,
    subTotal,
    shippingTotal,
    taxTotal,
    deliveryPrice,
    couponDiscount,
    walletApplied,
    pointsApplied,
    total,
    totalsError,
    isEmpty,
    items,
    cartTotal,
    currency,
    submitHandler,
    isCheckoutSubmit,
    globalSetting,
    storeSetting,
    storeCustomization,
    showingTranslateValue,
    showOrderSuccess,
    orderSuccessData,
    setShowOrderSuccess,
  };
};

export default useCheckoutSubmit;
