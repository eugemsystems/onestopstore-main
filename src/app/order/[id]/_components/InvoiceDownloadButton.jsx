"use client";

import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FiDownload } from "react-icons/fi";

import { Button } from "@components/ui/button";
import InvoicePDF from "@components/invoice/InvoiceForDownload";

/**
 * Compact "Download Invoice" action for the order-detail page — generates
 * the same PDF as the legacy invoice view, but without embedding a full
 * paper-invoice layout in the page itself.
 */
const InvoiceDownloadButton = ({ data, globalSetting }) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  if (!isClient || !data) return null;

  return (
    <PDFDownloadLink
      document={<InvoicePDF data={data} globalSetting={globalSetting} />}
      fileName={`Invoice-${data.invoice}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" isLoading={loading} loadingText="Generating...">
          <FiDownload className="mr-1.5" /> Invoice
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default InvoiceDownloadButton;
