"use client";

import React from "react";

//internal imports

import { formatPrice as formatPriceRaw } from "@utils/currencyFormat";
import ImageWithFallback from "@components/common/ImageWithFallBack";

const OrderTable = ({ data, currency, drawer }) => {
  // Order line items are historical charged amounts — render as-is in the
  // order's own currency, not the live currency the shopper has selected.
  const invoiceCurrency = currency || data?.currency_symbol || "$";
  const formatPrice = (value) => formatPriceRaw(value, invoiceCurrency);

  return (
    <tbody className="divide-y divide-border">
      {data?.cart?.map((item, i) => (
        <tr key={i}>
          <th className="px-6 py-2 text-sm font-normal text-muted-foreground text-left">
            {i + 1}{" "}
          </th>
          {drawer && (
            <td className="px-6 py-2 text-sm font-normal text-muted-foreground">
              <ImageWithFallback
                img
                width={40}
                height={40}
                src={item?.image}
                alt={item.title}
              />
            </td>
          )}
          <td className="px-6 py-2 text-sm font-normal text-muted-foreground">
            {item.title}
          </td>
          <td className="px-6 py-2 text-sm text-center text-muted-foreground">
            {item.quantity}{" "}
          </td>
          <td className="px-6 py-2 text-sm font-medium text-center text-muted-foreground">
            {formatPrice(item.price)}
          </td>

          <td className="px-6 py-2 text-sm text-right font-semibold text-muted-foreground">
            {formatPrice(item.itemTotal)}
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default OrderTable;
