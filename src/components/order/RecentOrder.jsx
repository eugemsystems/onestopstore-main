"use client";

import { Eye } from "lucide-react";
import React, { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoBagHandle } from "react-icons/io5";

//internal import
import OrderHistory from "./OrderHistory";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Pagination from "@components/pagination/Pagination";
import OrderDetailsDrawer from "@components/drawer/OrderDetailsDrawer";

const RecentOrder = ({ data, error, link, title }) => {
  const router = useRouter();
  const [orderData, setOrderData] = useState({});
  const { showingTranslateValue } = useUtilsFunction();
  const { setDrawerOpen } = useContext(SidebarContext);

  const handleChangePage = (page) => {
    // console.log("handleChangePage::", page);
    router.push(`?page=${page}`);
  };

  const handleOrderDetails = (order) => {
    setOrderData(order);
    setDrawerOpen(true);
  };
  // console.log("orders", data, "title", title);

  return (
    <>
      {orderData && <OrderDetailsDrawer data={orderData} />}
      <div className="max-w-screen-2xl mx-auto">
        <div className="rounded-md">
          {error ? (
            <h2 className="text-xl text-center my-10 mx-auto w-11/12 text-red-400">
              {error}
            </h2>
          ) : data?.orders?.length === 0 ? (
            <div className="text-center">
              <span className="flex justify-center my-30 pt-16 text-primary font-semibold text-6xl">
                <IoBagHandle />
              </span>
              <h2 className="font-medium text-md my-4 text-muted-foreground">
                You Have no order Yet!
              </h2>
            </div>
          ) : (
            <div className="flex flex-col">
              <h3 className="text-lg font-medium mb-5">
                {showingTranslateValue(title)}
              </h3>
              <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="align-middle inline-block min-w-full pb-2 sm:px-6 lg:px-8 rounded-md">
                  <div className="overflow-hidden border-b last:border-b-0 border-border rounded-md">
                    <div className="inline-block min-w-full py-2 align-middle">
                      <div className="overflow-hidden border border-border sm:rounded-lg">
                        <table className="table-auto min-w-full divide-y divide-border">
                          <thead className="bg-muted pb-10">
                            <tr className="bg-muted">
                              <th
                                scope="col"
                                className="py-3 pr-1 pl-4 text-left text-sm font-semibold text-muted-foreground sm:pl-6"
                              >
                                Order Number
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-1 text-left text-sm font-semibold text-muted-foreground"
                              >
                                OrderTime
                              </th>

                              <th
                                scope="col"
                                className="px-3 py-1 text-left text-sm font-semibold text-muted-foreground"
                              >
                                Status
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-1 text-left text-sm font-semibold text-muted-foreground"
                              >
                                Total
                              </th>
                              <th
                                scope="col"
                                className="relative text-end py-1 pr-3 pl-3 text-sm sm:pr-6 font-semibold text-muted-foreground"
                              >
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border bg-background">
                            {data?.orders?.map((order) => (
                              <tr key={order._id}>
                                <OrderHistory order={order} />
                                <td className="px-4 text-sm whitespace-nowrap text-end">
                                  {link ? (
                                    <Link href={`/order/${order._id}`}>
                                      <span className="text-primary text-end cursor-pointer hover:text-primary transition-all p-3 font-semibold rounded-full flex items-center justify-end gap-1.5">
                                        <Eye className="h-4 w-4" />
                                      </span>
                                    </Link>
                                  ) : (
                                    <span
                                      onClick={() => {
                                        handleOrderDetails(order);
                                        setDrawerOpen(true);
                                      }}
                                      className="text-primary text-end cursor-pointer hover:text-primary transition-all p-3 font-semibold rounded-full flex items-center justify-end gap-1.5"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {data?.totalDoc > 10 && (
                      <Pagination
                        totalResults={data?.totalDoc}
                        resultsPerPage={10}
                        onChange={handleChangePage}
                        label="Product Page Navigation"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RecentOrder;
