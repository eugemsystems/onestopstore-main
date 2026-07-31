"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  IoReturnUpBackOutline,
  IoArrowForward,
  IoBagHandle,
} from "react-icons/io5";
import { FiFileText } from "react-icons/fi";

//internal import
import CartItem from "@components/cart/CartItem";
import AddressSelector from "@components/checkout/AddressSelector";
import CheckoutPaymentOptions from "@components/checkout/CheckoutPaymentOptions";
import useCheckoutSubmit from "@hooks/useCheckoutSubmit";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import OrderSuccessNotification from "@components/notifications/OrderSuccessNotification";

const CheckoutForm = ({ storeSetting, addresses, countries, wallet, point }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    addresses: liveAddresses,
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
    submitHandler,
    isCheckoutSubmit,
    storeCustomization,
    showingTranslateValue,
    showOrderSuccess,
    orderSuccessData,
    setShowOrderSuccess,
  } = useCheckoutSubmit({ addresses, wallet, point });

  const { formatPrice } = useUtilsFunction();
  const checkout = storeCustomization?.checkout;
  const shippingOptions = storeSetting?.delivery?.shipping_options || [];
  const paymentMethods = storeSetting?.payment_methods || [];

  if (!mounted) return null;

  return (
    <>
      <OrderSuccessNotification
        show={showOrderSuccess}
        onClose={() => setShowOrderSuccess(false)}
        orderId={orderSuccessData?.orderId}
        invoice={orderSuccessData?.invoice}
        total={orderSuccessData?.total}
        trackingId={orderSuccessData?.trackingId}
        currency={orderSuccessData?.currency}
      />

      <div className="py-10 lg:py-12 px-0 2xl:max-w-screen-2xl w-full xl:max-w-screen-xl flex flex-col md:flex-row lg:flex-row gap-0">
        {/* checkout form */}
        <div className="md:w-full lg:w-3/5 flex h-full flex-col order-2 sm:order-1 lg:order-1">
          <form onSubmit={submitHandler} className="mt-5 md:mt-0 md:col-span-2">
            {/* 01. Shipping Address */}
            <div className="form-group">
              <h2 className="font-semibold text-base text-muted-foreground pb-3">
                01. {showingTranslateValue(checkout?.shipping_details) || "Shipping Address"}
              </h2>
              <AddressSelector
                type="shipping"
                title="Shipping"
                addresses={liveAddresses}
                countries={countries}
                selectedId={shippingAddressId}
                onSelect={setShippingAddressId}
                onAddressCreated={handleAddressCreated}
              />
            </div>

            {/* 02. Billing Address */}
            <div className="form-group mt-10">
              <h2 className="font-semibold text-base text-muted-foreground pb-3">
                02. Billing Address
              </h2>
              <AddressSelector
                type="billing"
                title="Billing"
                addresses={liveAddresses}
                countries={countries}
                selectedId={billingAddressId}
                onSelect={setBillingAddressId}
                onAddressCreated={handleAddressCreated}
              />
            </div>

            {/* 03. Shipping Options */}
            <div className="form-group mt-10">
              <h2 className="font-semibold text-base text-muted-foreground pb-3">
                03. {showingTranslateValue(checkout?.shipping_cost) || "Shipping Options"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shippingOptions.map((option, i) => {
                  const isSelected = deliveryOption?.title === option.title;
                  return (
                    <label
                      key={i}
                      className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="delivery_option"
                          checked={isSelected}
                          onChange={() => setDeliveryOption(option)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-foreground">
                              {option.title}
                            </p>
                            <p className="text-sm font-bold text-primary shrink-0">
                              {Number(option.price) > 0 ? formatPrice(option.price) : "Free"}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 04. Order Note */}
            <div className="form-group mt-10">
              <h2 className="font-semibold text-base text-muted-foreground pb-3 flex items-center gap-2">
                <FiFileText /> Order Note
              </h2>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any special instruction for your order (optional)"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            {/* 05. Payment Options */}
            <div className="form-group mt-10">
              <h2 className="font-semibold text-base text-muted-foreground pb-3">
                05. {showingTranslateValue(checkout?.payment_method) || "Payment Options"}
              </h2>
              <CheckoutPaymentOptions
                methods={paymentMethods}
                value={paymentMethod}
                onChange={setPaymentMethod}
              />
            </div>

            <div className="grid grid-cols-6 gap-4 lg:gap-6 mt-10">
              <div className="col-span-6 sm:col-span-3">
                <Button className="w-full h-10 rounded-sm" variant="outline" type="button">
                  <Link href="/" className="flex justify-center text-center">
                    <span className="text-xl mr-2">
                      <IoReturnUpBackOutline />
                    </span>
                    {showingTranslateValue(checkout?.continue_button) || "Continue Shopping"}
                  </Link>
                </Button>
              </div>
              <div className="col-span-6 sm:col-span-3">
                <Button
                  type="submit"
                  variant="create"
                  disabled={isEmpty || isCheckoutSubmit}
                  isLoading={isCheckoutSubmit}
                  className="w-full h-10 rounded-sm"
                >
                  {isCheckoutSubmit ? (
                    "Processing"
                  ) : (
                    <span className="flex justify-center text-center">
                      {showingTranslateValue(checkout?.confirm_button) || "Place Order"}
                      <span className="text-xl ml-2">
                        <IoArrowForward />
                      </span>
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* order summary */}
        <div className="md:w-full lg:w-2/5 lg:ml-10 xl:ml-14 md:ml-6 flex flex-col h-full md:sticky lg:sticky top-44 md:order-2 lg:order-2">
          <div className="border p-5 lg:px-8 lg:py-8 rounded-xl bg-card border-border shadow-sm order-1 sm:order-2">
            <h2 className="font-semibold text-lg pb-4">
              {showingTranslateValue(checkout?.order_summary) || "Order Summary"}
            </h2>

            <div className="overflow-y-scroll flex-grow scrollbar-hide w-full max-h-64 bg-muted/30 rounded-lg block">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}

              {isEmpty && (
                <div className="text-center py-10">
                  <span className="flex justify-center my-auto text-muted-foreground font-semibold text-4xl">
                    <IoBagHandle />
                  </span>
                  <h2 className="font-medium text-sm pt-2 text-muted-foreground">
                    No Item Added Yet!
                  </h2>
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className="flex items-center mt-4 py-4 text-sm w-full font-semibold text-foreground">
              <div className="w-full">
                {couponInfo.couponCode ? (
                  <span className="bg-accent px-4 py-3 leading-tight w-full rounded-md flex justify-between items-center">
                    <p className="text-primary">
                      Coupon Applied{" "}
                      <span className="font-bold">{couponInfo.couponCode}</span>
                    </p>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs font-semibold text-muted-foreground hover:text-red-500"
                    >
                      Remove
                    </button>
                  </span>
                ) : (
                  <div className="flex flex-row items-start justify-end">
                    <Input
                      ref={couponRef}
                      type="text"
                      placeholder="Coupon Code"
                      className="px-4 py-2 h-10 mr-1 border border-border rounded-md focus:outline-none"
                    />
                    <Button
                      type="button"
                      onClick={handleCouponCode}
                      disabled={isCouponAvailable}
                      className="h-10 rounded-sm"
                      variant="create"
                    >
                      {showingTranslateValue(checkout?.apply_button) || "Apply"}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Wallet / Points */}
            {(canUseWallet || canUsePoints) && (
              <div className="space-y-2 py-3 border-t border-border/70">
                {canUseWallet && (
                  <label className="flex items-center justify-between text-sm cursor-pointer">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={useWallet}
                        onChange={(e) => setUseWallet(e.target.checked)}
                      />
                      Pay with Wallet Balance
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(availableWallet)} available
                    </span>
                  </label>
                )}
                {canUsePoints && (
                  <label className="flex items-center justify-between text-sm cursor-pointer">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={usePoints}
                        onChange={(e) => setUsePoints(e.target.checked)}
                      />
                      Redeem Points
                    </span>
                    <span className="font-semibold text-foreground">
                      {availablePoints} pts ({formatPrice(pointsValue)})
                    </span>
                  </label>
                )}
              </div>
            )}

            {/* Totals breakdown */}
            <div className="py-2 text-sm w-full font-semibold text-muted-foreground divide-y divide-border/70">
              <div className="flex items-center justify-between py-2">
                {showingTranslateValue(checkout?.sub_total) || "Subtotal"}
                <span className="text-foreground font-bold">{formatPrice(subTotal)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                {showingTranslateValue(checkout?.shipping_cost) || "Shipping"}
                <span className="text-foreground font-bold">
                  {formatPrice(shippingTotal + deliveryPrice)}
                </span>
              </div>
              {taxTotal > 0 && (
                <div className="flex items-center justify-between py-2">
                  Tax
                  <span className="text-foreground font-bold">{formatPrice(taxTotal)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex items-center justify-between py-2">
                  {showingTranslateValue(checkout?.discount) || "Coupon Discount"}
                  <span className="text-orange-500 font-bold">
                    -{formatPrice(couponDiscount)}
                  </span>
                </div>
              )}
              {walletApplied > 0 && (
                <div className="flex items-center justify-between py-2">
                  Wallet Applied
                  <span className="text-orange-500 font-bold">-{formatPrice(walletApplied)}</span>
                </div>
              )}
              {pointsApplied > 0 && (
                <div className="flex items-center justify-between py-2">
                  Points Applied
                  <span className="text-orange-500 font-bold">-{formatPrice(pointsApplied)}</span>
                </div>
              )}
            </div>

            {totalsError && (
              <p className="text-xs text-red-500 mt-1">{totalsError}</p>
            )}

            <div className="border-t mt-4">
              <div className="flex items-center font-bold justify-between pt-5 text-sm uppercase">
                {showingTranslateValue(checkout?.total_cost) || "Total"}
                <span className="font-extrabold text-lg">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutForm;
