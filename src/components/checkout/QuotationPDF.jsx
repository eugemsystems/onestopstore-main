// components/checkout/QuotationPDF.jsx
//
// A pre-purchase PDF a shopper can download from the checkout page before
// placing an order — e.g. to get sign-off from someone else, or keep a
// record of pricing at a point in time. Distinct from InvoiceForDownload.jsx
// (components/invoice/), which renders an already-PLACED order (has a real
// invoice number, a due date, a payment method that was actually used).
// A quotation has none of that yet — it's an estimate of what an order
// would cost right now, cart items included, nothing charged.
import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import dayjs from "dayjs";
import { formatPrice as formatPriceFn } from "@utils/currencyFormat";

const tw = createTw({
  theme: {
    extend: {
      colors: {
        primary: "#4361ee",
        secondary: "#3f37c9",
        accent: "#4895ef",
        light: "#f8f9fa",
        dark: "#212529",
      },
      fontSize: {
        xs: "10px",
        sm: "12px",
        base: "14px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
    },
  },
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 15,
  },
  tableHeader: {
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  summaryCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#4361ee",
  },
  col1: { width: "10%" },
  col2: { width: "45%" },
  col3: { width: "15%" },
  col4: { width: "15%" },
  col5: { width: "15%" },
});

/**
 * `data` shape, built by DownloadQuotationButton.jsx from the checkout
 * page's live cart/pricing state:
 * {
 *   cart: [{ title, quantity, price }],   // one row per cart line
 *   subTotal, shippingCost, discount, taxRate, taxAmount, total: number,
 *   user_info: { name, email, contact } | null,   // null for a guest who hasn't filled the form yet
 *   generatedAt: string,   // ISO timestamp, when this quotation was produced
 * }
 * `globalSetting` is the same store-settings object InvoiceForDownload.jsx
 * receives (logo, company_name, address, contact, email, website, vat_number).
 */
const QuotationPDF = ({ data, globalSetting }) => {
  const currency = globalSetting?.default_currency || "$";
  const fp = (val) => formatPriceFn(val, currency);

  // TODO(human): Design the quotation's actual layout here.
  //
  // InvoiceForDownload.jsx (components/invoice/) is the sibling component to
  // work from — it already solves the same layout problem (header with
  // company info, a billed-to block, a line-items table with the col1..col5
  // widths above, a summary card, a footer) for a real invoice. A quotation
  // needs most of the same pieces, with a few real decisions to make since
  // it's a DIFFERENT kind of document:
  //   - No invoice number / due date — what goes in their place? A
  //     "Quotation" title + generatedAt is one option; a validity window
  //     ("Valid for 7 days from <date>") is another common convention for
  //     quotes specifically.
  //   - No payment method (nothing's been paid) and no order status pill.
  //   - `data.user_info` can be null (someone downloading a quote before
  //     filling in their address) — decide what the "billed to" section
  //     shows in that case rather than crashing on missing fields.
  //   - Consider a visual cue that this is NOT a receipt/invoice (e.g. a
  //     watermark-style "QUOTATION — NOT A TAX INVOICE" label), since a
  //     customer or their accountant could otherwise mistake one for the
  //     other.
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text>Quotation PDF layout not yet implemented</Text>
      </Page>
    </Document>
  );
};

export default QuotationPDF;
