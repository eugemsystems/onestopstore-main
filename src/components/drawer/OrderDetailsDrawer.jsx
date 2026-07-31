"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useReactToPrint } from "react-to-print";
import {
  CreditCard,
  Download,
  MapPin,
  Package,
  Printer,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";

//internal import
import MainDrawer from "./MainDrawer";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { SidebarContext } from "@context/SidebarContext";
import { useSetting } from "@context/SettingContext";
import OrderItems from "@components/order/OrderItems";
import { Button } from "@components/ui/button";
import InvoicePDF from "@components/invoice/InvoiceForDownload";

const OrderDetailsDrawer = ({ data }) => {
  const printRef = useRef();
  const { drawerOpen, closeDrawer } = useContext(SidebarContext);
  const { globalSetting, storeCustomization } = useSetting();
  const { showingTranslateValue, formatPrice } = useUtilsFunction();

  const dashboard = storeCustomization?.dashboard;

  const handlePrintInvoice = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${data?.invoice}`,
  });

  // Flag to only render PDFDownloadLink after client mount
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <MainDrawer open={drawerOpen} onClose={closeDrawer}>
      <div className="flex flex-col w-full h-full justify-between items-middle bg-background rounded">
        <div
          ref={printRef}
          className="overflow-y-scroll scrollbar-hide w-full max-h-full"
        >
          <div className="w-full flex justify-between items-center relative px-5 py-4 border-b bg-primary/5 border-border">
            <div className="flex flex-col">
              <h2 className="font-semibold text-lg m-0 text-foreground flex items-center">
                Invoice No #{data?.invoice}
              </h2>

              <div className="text-sm">
                {(data.status === "Delivered" ||
                  data?.status === "delivered") && (
                  <span className="flex items-center gap-x-2 justify-start">
                    <div className="flex-none rounded-full bg-green-400/10 p-1 text-green-400">
                      <div className="size-2.5 rounded-full bg-current"></div>
                    </div>
                    <span className="block capitalize">{data.status}</span>
                  </span>
                )}
                {(data.status === "Pending" || data?.status === "pending") && (
                  <span className="flex items-center gap-x-2 justify-start">
                    <div className="flex-none rounded-full bg-orange-400/10 p-1 text-orange-400">
                      <div className="size-2.5 rounded-full bg-current"></div>
                    </div>
                    <span className="block capitalize">{data.status}</span>
                  </span>
                )}
                {(data.status === "Cancel" || data.status === "cancel") && (
                  <span className="flex items-center gap-x-2 justify-start">
                    <div className="flex-none rounded-full bg-red-400/10 p-1 text-red-400">
                      <div className="size-2.5 rounded-full bg-current"></div>
                    </div>
                    <span className="block capitalize">{data.status}</span>
                  </span>
                )}
                {(data.status === "Processing" ||
                  data.status === "processing") && (
                  <span className="flex items-center gap-x-2 justify-start">
                    <div className="flex-none rounded-full bg-primary/10 p-1 text-primary">
                      <div className="size-2.5 rounded-full bg-current"></div>
                    </div>
                    <span className="block capitalize">{data.status}</span>
                  </span>
                )}
                {(data.status === "Out-for-delivery" ||
                  data.status === "out-for-delivery") && (
                  <span className="flex items-center gap-x-2 justify-start">
                    <div className="flex-none rounded-full bg-teal-400/10 p-1 text-teal-400">
                      <div className="size-2.5 rounded-full bg-current"></div>
                    </div>
                    <span className="block capitalize">
                      {data.status.replace(/-/g, " ")}
                    </span>
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="inline-flex print:hidden text-base items-center cursor-pointer justify-center text-muted-foreground p-2 focus:outline-none transition-opacity hover:text-red-400"
            >
              <X />
              <span className="font-sens text-sm text-muted-foreground hover:text-red-400 ml-1">
                Close
              </span>
            </button>
          </div>
          <div className="overflow-y-scroll flex-grow scrollbar-hide w-full max-h-full px-3 sm:px-6 py-4">
            <div className="bg-accent rounded-md mb-5 px-4 py-3 hidden">
              <label>
                {showingTranslateValue(dashboard?.invoice_message_first)}{" "}
                <span className="font-bold text-primary">
                  {data?.user_info?.name},
                </span>{" "}
                {showingTranslateValue(dashboard?.invoice_message_last)}
              </label>
            </div>

            <OrderItems drawer data={data} />
            <div className="border border-border mt-4 rounded-md">
              {data?.status === "delivered" ||
                (data?.status === "Delivered" && (
                  <div className="flex items-center gap-3 p-4 border-b border-border">
                    <span>
                      <Truck
                        aria-hidden="true"
                        className="size-4.5 text-muted-foreground shrink-0"
                      />
                    </span>
                    <div className="items-center gap-4 flex justify-between flex-wrap">
                      <span className="font-semibold text-base">Delivery </span>
                      <span className="text-muted-foreground text-sm">
                        Estimated Delivery: <strong>Feb 8, 2025</strong>
                      </span>
                    </div>
                  </div>
                ))}
              <div className="flex flex-col text-muted-foreground p-4 text-sm">
                <span>{data?.user_info?.name}</span>
                <span>{data?.user_info?.email} </span>
                <span>
                  {data?.user_info?.address} {data?.city} {data?.country}
                  {data?.zipCode}
                </span>
                <span className="font-medium">{data?.user_info?.contact}</span>
              </div>
            </div>
            <div className="mt-6 border border-border rounded-md">
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <span>
                  <CreditCard
                    aria-hidden="true"
                    className="size-4.5 text-muted-foreground shrink-0"
                  />
                </span>
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <h4 className="font-semibold text-base">Payment</h4>
                  <p className="text-muted-foreground text-sm">
                    Payment Method: <strong>{data?.paymentMethod}</strong>
                  </p>
                </div>
              </div>
              <div className="flex flex-col text-muted-foreground p-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Shipping Cost</span>
                  <span className="text-foreground font-semibold">
                    {formatPrice(data.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Discount</span>
                  <span className="text-foreground font-semibold">
                    {formatPrice(data.discount)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground bg-muted px-4 py-2">
                <span>Total Amount</span>
                <span className="text-red-500 font-bold text-base">
                  {formatPrice(data.total)}
                </span>
              </div>
            </div>

            {/* Tracking Info */}
            {data?.trackingId && (
              <div className="mt-4 border border-border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Tracking Info</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tracking ID</span>
                    <span className="font-mono font-semibold text-primary">
                      {data.trackingId}
                    </span>
                  </div>
                  {data?.trackingStatus && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tracking Status
                      </span>
                      <span className="capitalize font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                        {data.trackingStatus.replace(/-/g, " ")}
                      </span>
                    </div>
                  )}
                  {data?.deliveryBoyName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Delivery Partner
                      </span>
                      <span className="font-medium">
                        {data.deliveryBoyName}
                      </span>
                    </div>
                  )}
                </div>
                <Link
                  href={`/track/${data.trackingId}`}
                  onClick={closeDrawer}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  Track Order
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="bg-neutral-50 dark:bg-background p-6 mt-4">
          <div className="flex space-x-3 flex-wrap justify-between">
            {isClient && (
              <PDFDownloadLink
                document={
                  <InvoicePDF data={data} globalSetting={globalSetting} />
                }
                fileName={`Invoice-${data.invoice}.pdf`}
              >
                {({ loading }) => (
                  <Button variant="create">
                    {loading ? "Generating..." : "Download PDF"}{" "}
                    <Download className="ml-2" />
                  </Button>
                )}
              </PDFDownloadLink>
            )}

            <Button onClick={handlePrintInvoice} variant="import">
              {showingTranslateValue(dashboard?.print_button)}{" "}
              <span className="ml-2">
                <Printer />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </MainDrawer>
  );
};

export default dynamic(() => Promise.resolve(OrderDetailsDrawer), {
  ssr: false,
});
