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
const QUOTE_VALIDITY_DAYS = 7;

const QuotationPDF = ({ data, globalSetting }) => {
  const currency = globalSetting?.default_currency || "$";
  const fp = (val) => formatPriceFn(val, currency);

  const generated = dayjs(data?.generatedAt);
  // Short, human-readable reference rather than a real sequential number —
  // this document was never persisted anywhere, so there's nothing to look
  // up against. Stable for a given generatedAt, in case the same quote is
  // re-downloaded.
  const quoteRef = generated.isValid() ? `Q-${generated.format("YYYYMMDD-HHmmss")}` : "Q-DRAFT";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={tw("flex flex-row justify-between items-start mb-8")}>
          <View>
            <Text style={tw("text-2xl font-bold text-primary uppercase tracking-wider")}>
              Quotation
            </Text>
            <View style={tw("mt-1 px-3 py-1 bg-accent rounded-full inline-block")}>
              <Text style={tw("text-white text-xs font-bold")}>
                NOT A TAX INVOICE — ESTIMATE ONLY
              </Text>
            </View>
          </View>

          <View style={tw("text-right")}>
            {(globalSetting?.invoice_logo || globalSetting?.logo) && (
              <Image
                src={globalSetting?.invoice_logo || globalSetting.logo}
                style={tw("w-36 h-12 mb-2")}
              />
            )}
            <Text style={tw("font-bold")}>
              {globalSetting?.company_name || "Company Name"}
            </Text>
            <Text style={tw("text-xs")}>{globalSetting?.address}</Text>
            <Text style={tw("text-xs")}>
              {globalSetting?.contact} • {globalSetting?.email}
            </Text>
            <Text style={tw("text-xs")}>
              {globalSetting?.website}
              {globalSetting?.vat_number && ` • VAT: ${globalSetting.vat_number}`}
            </Text>
          </View>
        </View>

        {/* Quotation details */}
        <View style={tw("flex flex-row justify-between mb-8")}>
          <View>
            <Text style={tw("text-sm font-bold text-dark mb-2")}>PREPARED FOR:</Text>
            {data?.user_info?.name || data?.user_info?.email || data?.user_info?.contact ? (
              <>
                <Text style={tw("text-sm")}>{data.user_info.name || "Customer"}</Text>
                {data.user_info.email && (
                  <Text style={tw("text-sm text-muted-foreground")}>{data.user_info.email}</Text>
                )}
                {data.user_info.contact && (
                  <Text style={tw("text-sm text-muted-foreground")}>{data.user_info.contact}</Text>
                )}
              </>
            ) : (
              <Text style={tw("text-sm text-muted-foreground")}>
                Guest — address not yet provided
              </Text>
            )}
          </View>

          <View style={tw("text-right")}>
            <View style={tw("flex flex-row mb-1")}>
              <Text style={tw("w-28 text-sm font-bold text-dark text-left")}>Quote Ref:</Text>
              <Text style={tw("text-sm")}>{quoteRef}</Text>
            </View>
            <View style={tw("flex flex-row mb-1")}>
              <Text style={tw("w-28 text-sm font-bold text-dark text-left")}>Generated:</Text>
              <Text style={tw("text-sm")}>
                {generated.isValid() ? generated.format("MMMM D, YYYY") : "—"}
              </Text>
            </View>
            <View style={tw("flex flex-row mb-1")}>
              <Text style={tw("w-28 text-sm font-bold text-dark text-left")}>Valid Until:</Text>
              <Text style={tw("text-sm")}>
                {generated.isValid()
                  ? generated.add(QUOTE_VALIDITY_DAYS, "day").format("MMMM D, YYYY")
                  : "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* Line items */}
        <View style={tw("mb-6")}>
          <View style={[tw("flex flex-row py-3 px-4"), styles.tableHeader]}>
            <View style={[styles.col1, tw("text-center")]}>
              <Text style={tw("text-sm font-bold text-dark")}>#</Text>
            </View>
            <View style={[styles.col2, tw("pl-2")]}>
              <Text style={tw("text-sm font-bold text-dark")}>DESCRIPTION</Text>
            </View>
            <View style={[styles.col3, tw("text-center")]}>
              <Text style={tw("text-sm font-bold text-dark")}>QTY</Text>
            </View>
            <View style={[styles.col4, tw("text-right")]}>
              <Text style={tw("text-sm font-bold text-dark")}>PRICE</Text>
            </View>
            <View style={[styles.col5, tw("text-right")]}>
              <Text style={tw("text-sm font-bold text-dark")}>AMOUNT</Text>
            </View>
          </View>

          {(data?.cart || []).map((item, index) => (
            <View style={[tw("flex flex-row py-3 px-4"), styles.tableRow]} key={index}>
              <View style={[styles.col1, tw("text-center")]}>
                <Text style={tw("text-sm")}>{index + 1}</Text>
              </View>
              <View style={[styles.col2, tw("pl-2")]}>
                <Text style={tw("text-sm")}>{item.title}</Text>
              </View>
              <View style={[styles.col3, tw("text-center")]}>
                <Text style={tw("text-sm")}>{item.quantity}</Text>
              </View>
              <View style={[styles.col4, tw("text-right")]}>
                <Text style={tw("text-sm")}>{fp(item.price)}</Text>
              </View>
              <View style={[styles.col5, tw("text-right")]}>
                <Text style={tw("text-sm")}>{fp(item.price * item.quantity)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={[styles.summaryCard, tw("ml-auto w-64")]}>
          <View style={tw("flex flex-row justify-between mb-1")}>
            <Text style={tw("text-sm text-muted-foreground")}>Subtotal:</Text>
            <Text style={tw("text-sm")}>{fp(data?.subTotal)}</Text>
          </View>

          {data?.shippingCost > 0 && (
            <View style={tw("flex flex-row justify-between mb-1")}>
              <Text style={tw("text-sm text-muted-foreground")}>Shipping:</Text>
              <Text style={tw("text-sm")}>{fp(data?.shippingCost)}</Text>
            </View>
          )}

          {data?.discount > 0 && (
            <View style={tw("flex flex-row justify-between mb-1")}>
              <Text style={tw("text-sm text-muted-foreground")}>Discount:</Text>
              <Text style={tw("text-sm text-green-600")}>-{fp(data?.discount)}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={tw("flex flex-row justify-between mt-2")}>
            <Text style={tw("text-base font-bold text-dark")}>Estimated Total:</Text>
            <Text style={tw("text-base font-bold text-primary")}>{fp(data?.total)}</Text>
          </View>

          {data?.taxAmount > 0 && (
            <Text style={tw("text-xs text-muted-foreground text-right mt-1")}>
              Includes {fp(data.taxAmount)} tax
            </Text>
          )}
        </View>

        {/* Footer */}
        <View
          style={[
            tw("mt-auto pt-8"),
            { position: "absolute", bottom: 40, left: 40, right: 40 },
          ]}
        >
          <View style={styles.divider} />
          <Text style={tw("text-xs text-center text-muted-foreground")}>
            This is an estimate only, not a bill or a confirmed order — prices, stock, and
            promotions may change before checkout is completed. No payment has been taken.
          </Text>
          <View style={tw("flex flex-row justify-between mt-2")}>
            <Text style={tw("text-xs text-muted-foreground")}>
              Generated on {generated.isValid() ? generated.format("MMMM D, YYYY") : "—"}
            </Text>
            <Text style={tw("text-xs text-muted-foreground")}>
              {globalSetting?.company_name || "Company Name"} • {quoteRef}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default QuotationPDF;
