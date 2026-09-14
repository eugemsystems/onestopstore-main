"use client";

import { useEffect, useState } from "react";
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

  if (!isClient || !items?.length) return null;

  const data = {
    cart: items,
    subTotal,
    shippingCost,
    discount,
    taxRate,
    taxAmount,
    total,
    user_info: userInfo,
    generatedAt: new Date().toISOString(),
  };

  return (
    <PDFDownloadLink
      document={<QuotationPDF data={data} globalSetting={globalSetting} />}
      fileName={`Quotation-${new Date().toISOString().slice(0, 10)}.pdf`}
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
