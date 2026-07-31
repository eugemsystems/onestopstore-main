"use client";

import Image from "next/image";

/**
 * Payment gateway picker — mirrors legacy Checkout/PaymentOptions.jsx:
 * same logos (public/payment-logos, copied from the legacy app), same
 * per-gateway title/description text, driven by the admin-enabled gateway
 * list (storeSetting.payment_methods), restyled for the current theme.
 */
const logoFor = (name) => {
  const k = String(name || "").toLowerCase().replace(/[\s_-]/g, "");
  if (k.includes("pese")) return "/payment-logos/pesepay.png";
  if (k.includes("payfast")) return "/payment-logos/payfast.png";
  if (k.includes("paypal")) return "/payment-logos/paypal.png";
  if (k.includes("paynow")) return "/payment-logos/paynow.png";
  if (k.includes("pdo_zambia") || k.includes("dpo") || k.includes("zambia"))
    return "/payment-logos/dpo.png";
  if (k.includes("yoco") || k.includes("yoko")) return "/payment-logos/yoco.png";
  if (k.includes("bank_transfer") || k.includes("banktransfer"))
    return "/payment-logos/banking.png";
  if (k.includes("cod") || k.includes("cashondelivery"))
    return "/payment-logos/cod.png";
  return "/payment-logos/banking.png";
};

const normalize = (s) => String(s || "").toLowerCase().replace(/[\s_-]/g, "");

const titleFor = (name) => {
  const k = normalize(name);
  if (k.includes("payfast")) return "Credit & Debit Card";
  if (k.includes("pdozambia") || k.includes("dpozambia") || k.includes("dpo"))
    return "Airtel & MTN Money";
  if (k.includes("pese") || k.includes("pesepay")) return "Ecocash & InnBucks";
  if (k.includes("yoco") || k.includes("yoko")) return "Visa, Apple Pay & Google";
  if (k.includes("cod") || k.includes("cashondelivery")) return "Office Payment";
  if (k.includes("banktransfer") || k.includes("bank_transfer")) return "Bank Transfer";
  return name;
};

const descriptionFor = (name) => {
  const k = normalize(name);
  if (k.includes("payfast"))
    return "Pay with Credit & Debit Card, Apple Pay, Samsung and more.";
  if (k.includes("pdozambia") || k.includes("dpozambia") || k.includes("dpo"))
    return "Pay with Airtel Money and MTN money";
  if (k.includes("pese") || k.includes("pesepay"))
    return "Pay with Ecocash, InnBucks & Zimswitch Card";
  if (k.includes("yoco") || k.includes("yoko"))
    return "Pay with Visa, Amex, Mastercard, Apple Pay & Google";
  if (k.includes("cod") || k.includes("cashondelivery"))
    return "Pay with Cash or Card at the nearest Office.";
  if (k.includes("banktransfer") || k.includes("bank_transfer"))
    return "You can pay with EFT or Direct Deposit into our bank account.";
  return "";
};

const CheckoutPaymentOptions = ({ methods, value, onChange }) => {
  return (
    <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
      {(methods || []).map((method) => {
        const isSelected = value === method.name;
        return (
          <label
            key={method.name}
            htmlFor={`payment-${method.name}`}
            className={`cursor-pointer rounded-xl border-2 p-4 transition-all flex items-center gap-4 ${
              isSelected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/50"
            }`}
          >
            <input
              type="radio"
              id={`payment-${method.name}`}
              name="payment_method"
              checked={isSelected}
              onChange={() => onChange(method.name)}
            />
            <div className="relative h-10 w-20 shrink-0">
              <Image
                src={logoFor(method.name)}
                alt={method.title || method.name}
                fill
                sizes="80px"
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {titleFor(method.name)}
              </p>
              {descriptionFor(method.name) && (
                <p className="text-xs text-muted-foreground">
                  {descriptionFor(method.name)}
                </p>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
};

export default CheckoutPaymentOptions;
