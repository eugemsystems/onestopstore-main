"use client";

import useUtilsFunction from "@hooks/useUtilsFunction";

const Price = ({ product, price, card, originalPrice, currency, campaign, isFrom }) => {
  const { formatPrice } = useUtilsFunction();

  // When campaign data is present, always use the passed price/originalPrice directly
  const isCombo = product?.isCombination;
  const finalPrice = campaign
    ? price
    : isCombo
      ? price
      : product?.prices?.price;
  const finalOriginal = campaign ? originalPrice : originalPrice;
  const discountAmount =
    finalOriginal > finalPrice ? finalOriginal - finalPrice : 0;

  return (
    <>
      <div className="product-price font-bold">
        {isFrom && !campaign && (
          <span
            className={`mr-1 font-normal text-muted-foreground ${
              card ? "text-xs" : "text-sm"
            }`}
          >
            From
          </span>
        )}
        <span
          className={`${
            card
              ? "inline-block text-base text-foreground"
              : "inline-block text-xl"
          }`}
        >
          {formatPrice(finalPrice, currency)}
        </span>
        {discountAmount > 0 && (
          <span
            className={
              card
                ? "sm:text-sm font-normal text-base text-muted-foreground ml-1"
                : "text-sm font-normal text-muted-foreground ml-1"
            }
          >
            <del> {formatPrice(finalOriginal, currency)}</del>
          </span>
        )}
      </div>

      {/* {discountAmount > 0 && !card && (
        <p className="text-xs text-primary">
          Save {formatPrice(discountAmount, currency)} ({discountPercent}% off)
        </p>
      )} */}
    </>
  );
};

export default Price;
