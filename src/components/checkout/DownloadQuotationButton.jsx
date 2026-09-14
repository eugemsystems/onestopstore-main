"use client";

import { useEffect, useMemo, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FiFileText } from "react-icons/fi";

import QuotationPDF from "@components/checkout/QuotationPDF";
import { Button } from "@components/ui/button";
import { useSetting } from "@context/SettingContext";

/**
 * "Download Quotation (PDF)" button for the checkout page — lets a shopper
 * get a PDF of their current cart/pricing before placing the order, e.g.
 * to get sign-off from someone else. Mirrors the PDFDownloadLink wiring in
 * components/invoice/DownloadPrintButton.jsx (client-mount gate + render-
 * prop loading state), pointed at QuotationPDF instead of InvoicePDF.
 */
const DownloadQuotationButton = ({
  items,
  subTotal,
  shippingCost,
  discount = 0,
  taxRate = 0,
  taxAmount = 0,
  total,
  userInfo = null,
}) => {
  const { globalSetting } = useSetting();

  // PDFDownloadLink renders a blob URL that only exists client-side —
  // rendering it during SSR (or before hydration) throws.
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  // PDFDownloadLink regenerates the PDF blob whenever the `document` element
  // it's given changes identity — building a fresh `data` object (and a
  // fresh `new Date()`) inline on every render meant it never saw the same
  // props twice, so it silently re-rendered the PDF on every unrelated
  // re-render of the checkout page (e.g. the notification-count poll),
  // flooding the console and visibly stalling clicks. Only recompute when
  // the actual cart/pricing values change.
  const data = useMemo(
    () => ({
      cart: items,
      subTotal,
      shippingCost,
      discount,
      taxRate,
      taxAmount,
      total,
      user_info: userInfo,
      generatedAt: new Date().toISOString(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, subTotal, shippingCost, discount, taxRate, taxAmount, total, userInfo],
  );

  if (!isClient || !items?.length) return null;

  return (
    <PDFDownloadLink
      document={<QuotationPDF data={data} globalSetting={globalSetting} />}
      fileName={`Quotation-${data.generatedAt.slice(0, 10)}.pdf`}
    >
      {({ loading }) => (
        <Button
          type="button"
          variant="outline"
          isLoading={loading}
          loadingText="Generating PDF..."
          className="w-full h-10 rounded-sm"
        >
          Download Quotation
          <span className="ml-2">
            <FiFileText />
          </span>
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default DownloadQuotationButton;
