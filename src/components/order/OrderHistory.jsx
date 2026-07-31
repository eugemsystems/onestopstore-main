"use client";
import React from "react";
import dayjs from "dayjs";
import useUtilsFunction from "@hooks/useUtilsFunction";

const OrderHistory = ({ order }) => {
  const { formatPrice } = useUtilsFunction();

  return (
    <>
      <td className="py-3 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-foreground sm:pl-6">
        <span className="text-sm font-semibold">
          #{order?.trackingId || order?._id}
        </span>
      </td>
      <td className="px-3 py-3 text-sm whitespace-nowrap text-muted-foreground">
        <span className="text-sm">
          {dayjs(order.createdAt).format("MMMM D, YYYY")}
        </span>
      </td>

      <td className="px-3 py-3 text-sm whitespace-nowrap text-muted-foreground">
        {(order.status === "Delivered" || order.status === "delivered") && (
          <span className="flex items-center gap-x-2 justify-start">
            {" "}
            <div className="flex-none rounded-full bg-green-400/10 p-1 text-green-400">
              <div className="size-1.5 rounded-full bg-current"></div>
            </div>
            <span className="block capitalize">{order.status}</span>
          </span>
        )}
        {(order.status === "Pending" || order.status === "pending") && (
          <span className="flex items-center gap-x-2 justify-start">
            <div className="flex-none rounded-full bg-orange-400/10 p-1 text-orange-400">
              <div className="size-1.5 rounded-full bg-current"></div>
            </div>
            <span className="block capitalize">{order.status}</span>
          </span>
        )}
        {(order.status === "Cancel" || order.status === "cancel") && (
          <span className="flex items-center gap-x-2 justify-start">
            <div className="flex-none rounded-full bg-red-400/10 p-1 text-red-400">
              <div className="size-1.5 rounded-full bg-current"></div>
            </div>
            <span className="block capitalize">{order.status}</span>
          </span>
        )}
        {(order.status === "Processing" || order.status === "processing") && (
          <span className="flex items-center gap-x-2 justify-start">
            <div className="flex-none rounded-full bg-primary/10 p-1 text-primary">
              <div className="size-1.5 rounded-full bg-current"></div>
            </div>
            <span className="block capitalize">{order.status}</span>
          </span>
        )}
        {(order.status === "Out-for-delivery" ||
          order.status === "out-for-delivery") && (
          <span className="flex items-center gap-x-2 justify-start">
            <div className="flex-none rounded-full bg-teal-400/10 p-1 text-teal-400">
              <div className="size-1.5 rounded-full bg-current"></div>
            </div>
            <span className="block capitalize">
              {order.status.replace(/-/g, " ")}
            </span>
          </span>
        )}
      </td>

      <td className="px-3 py-3 text-sm whitespace-nowrap text-muted-foreground">
        <span className="text-sm font-bold">{formatPrice(order?.total)}</span>
      </td>
    </>
  );
};

export default OrderHistory;
