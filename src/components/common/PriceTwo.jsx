"use client";

import useUtilsFunction from "@hooks/useUtilsFunction";

const Price = ({ product, price, card, currency, originalPrice, isFrom }) => {
  const { formatPrice } = useUtilsFunction();

  return (
    <div className="product-price font-bold">
      {product?.isCombination ? (
        <>
          {isFrom && (
            <span
              className={`mr-1 font-normal text-muted-foreground ${
                card ? "text-xs" : "text-sm"
              }`}
            >
              From
            </span>
          )}
          <span
            className={
              card
                ? "inline-block text-base text-foreground"
                : "inline-block text-xl"
            }
          >
            {formatPrice(price, currency)}
          </span>
          {originalPrice > price ? (
            <>
              <del
                className={
                  card
                    ? "sm:text-sm font-normal text-base text-muted-foreground ml-1"
                    : "text-lg font-normal text-muted-foreground ml-1"
                }
              >
                {formatPrice(originalPrice, currency)}
              </del>
            </>
          ) : null}
        </>
      ) : (
        <>
          <div className="relative mb-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Originally:</div>
              <div className="text-xs text-muted-foreground font-semibold">
                {originalPrice > price ? (
                  <>
                    <del
                      className={
                        card
                          ? "font-normal text-xs text-muted-foreground ml-1"
                          : "text-base font-normal text-muted-foreground ml-1"
                      }
                    >
                      {formatPrice(originalPrice, currency)}
                    </del>
                  </>
                ) : null}
              </div>
            </div>
            {/* Wavy Line Background */}
            <div
              className="relative h-5 w-full bg-no-repeat bg-contain bg-center mt-1"
              style={{
                backgroundImage: `url('https://i.ibb.co.com/GQQy11TV/display-price-line.webp')`,
              }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-[#ef4a23] mt-6">
                <span
                  className={
                    card
                      ? "inline-block text-base text-foreground"
                      : "inline-block text-xl"
                  }
                >
                  {formatPrice(price, currency)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Price;
