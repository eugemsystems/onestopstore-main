"use client";

import React from "react";

//internal imports

import useUtilsFunction from "@hooks/useUtilsFunction";
import ImageWithFallback from "@components/common/ImageWithFallBack";

const OrderTime = ({ data, drawer }) => {
  const { formatPrice } = useUtilsFunction();

  return (
    <ul role="list" className="divide-y divide-border">
      {data?.cart?.map((item, i) => (
        <li key={i} className="flex gap-x-4 py-4 items-center">
          {drawer && (
            <ImageWithFallback
              img
              width={40}
              height={40}
              src={item?.image}
              alt={item.title}
              className="size-16 flex-none rounded-md bg-muted"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm/6 font-semibold text-foreground mb-0 leading-normal">
              {item.title}
            </p>

            <span className="my-1 truncate text-xs/5 text-muted-foreground">
              Qty: {item.quantity} x {formatPrice(item.price)}
            </span>
            <div className="font-bold text-sm">
              {formatPrice(item.itemTotal)}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default OrderTime;
