"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  FiArrowLeft,
  FiCreditCard,
  FiMapPin,
  FiTruck,
  FiFileText,
  FiRotateCcw,
} from "react-icons/fi";

import { Button } from "@components/ui/button";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { useSetting } from "@context/SettingContext";
import { payOrderNow } from "@services/OrderServices";
import CheckoutPaymentOptions from "@components/checkout/CheckoutPaymentOptions";
import { notifyError } from "@utils/toast";
import { listReturnsForOrderAction } from "@lib/actions/account-extras.actions";
import ReturnRequestModal from "./ReturnRequestModal";

// PDF generation touches browser-only APIs — keep it out of the server bundle.
const InvoiceDownloadButton = dynamic(
  () => import("./InvoiceDownloadButton"),
  { ssr: false },
);

const OFFLINE_METHODS = ["cod", "bank_transfer", "wallet"];

// Fixed pickup/delivery route — mirrors the legacy frontend's tracker, since
// this store doesn't (yet) have its own /order-status list endpoint.
const ROUTE_DELIVERY = [
  "pending",
  "processing",
  "shipped",
  "outfordelivery",
  "delivered",
];
const ROUTE_PICKUP = [
  "pending",
  "processing",
  "shipped",
  "readyforcollection",
  "collected",
];
const STEP_LABEL = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  outfordelivery: "Out for Delivery",
  delivered: "Delivered",
  readyforcollection: "Ready for Collection",
  collected: "Collected",
};

const normalizeKey = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const statusBadgeClass = (slug) => {
  const s = normalizeKey(slug);
  if (["delivered", "collected"].includes(s))
    return "bg-emerald-50 text-emerald-600 border-emerald-200";
  if (s === "cancelled") return "bg-red-50 text-red-600 border-red-200";
  if (["shipped", "outfordelivery", "intransit"].includes(s))
    return "bg-blue-50 text-blue-600 border-blue-200";
  if (s === "readyforcollection")
    return "bg-purple-50 text-purple-600 border-purple-200";
  if (s === "processing")
    return "bg-amber-50 text-amber-600 border-amber-200";
  return "bg-muted text-muted-foreground border-border";
};

// Only items on a delivered/collected order, that aren't marked
// non-returnable, can be returned — mirrors the legacy frontend's canReturn
// gate in DetailsTable.jsx (delivered/collected orders, warranty !=
// "Non-Returnable", is_return not explicitly false).
const canReturnItem = (statusSlug, item) => {
  const s = normalizeKey(statusSlug);
  if (!["delivered", "collected"].includes(s)) return false;
  if (String(item?.warranty || "").toLowerCase().startsWith("non-returnable")) return false;
  const flag = item?.isReturnable;
  if (flag === false || flag === 0 || flag === "0") return false;
  return true;
};

const OrderTracker = ({ statusSlug, statusName }) => {
  const isCancelled = normalizeKey(statusSlug) === "cancelled";
  if (isCancelled) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-600">
        This order was cancelled.
      </div>
    );
  }

  const currentKey = normalizeKey(statusName || statusSlug);
  const route = ROUTE_PICKUP.includes(currentKey) && currentKey === "readyforcollection"
    ? ROUTE_PICKUP
    : ROUTE_DELIVERY.includes(currentKey)
      ? ROUTE_DELIVERY
      : ROUTE_PICKUP;
  const currentIdx = Math.max(0, route.indexOf(currentKey));

  return (
    <div className="flex items-center overflow-x-auto pb-2">
      {route.map((key, idx) => {
        const done = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <div key={key} className="flex flex-1 min-w-[6rem] items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border-2 ${
                  done
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                } ${isCurrent ? "ring-4 ring-primary/15" : ""}`}
              >
                {done ? "✓" : idx + 1}
              </div>
              <span
                className={`text-[10px] font-medium text-center whitespace-nowrap ${
                  done ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {STEP_LABEL[key]}
              </span>
            </div>
            {idx < route.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 ${idx < currentIdx ? "bg-primary" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const OrderDetailView = ({ orderId, order, error, paymentMethods, statusParam }) => {
  const { formatPrice, showDateFormat } = useUtilsFunction();
  const { globalSetting } = useSetting();
  const [showPay, setShowPay] = useState(false);
  const [payMethod, setPayMethod] = useState("");
  const [paying, setPaying] = useState(false);
  const [returnedIds, setReturnedIds] = useState([]);
  const [returnItem, setReturnItem] = useState(null);

  // Laravel's /returns endpoint keys off the order's raw numeric id (same
  // field the legacy frontend's ReturnModal uses as `orderId={data?.id}`),
  // not the order_number carried in the route param / order.orderId.
  const orderNumericId = order?.id;

  useEffect(() => {
    if (!orderNumericId) return;
    (async () => {
      const { data } = await listReturnsForOrderAction(orderNumericId);
      const list = Array.isArray(data) ? data : data?.data || [];
      setReturnedIds(list.map((r) => String(r?.product_id)).filter(Boolean));
    })();
  }, [orderNumericId]);

  const markReturned = (productId) => {
    setReturnedIds((prev) => [...prev, String(productId)]);
  };

  if (error || !order) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        {error || "This order could not be found."}
      </div>
    );
  }

  const statusSlug = order?.order_status?.slug || order?.status;
  const statusName = order?.order_status?.name || order?.status;
  const paymentStatus = String(order?.payment_status || "").toUpperCase();
  const paymentMethodKey = normalizeKey(order?.payment_method);
  const isOffline = OFFLINE_METHODS.some((m) => paymentMethodKey.includes(m.replace("_", "")));
  const showPayNow =
    (paymentStatus === "FAILED" || paymentStatus === "PENDING") &&
    normalizeKey(statusSlug) !== "cancelled" &&
    !isOffline;

  // Prefer the raw Laravel product rows (pivot data) for per-item detail;
  // fall back to the normalized `cart` array if they're not present.
  const items =
    Array.isArray(order?.products) && order.products.length > 0
      ? order.products.map((p) => {
          const qty = Number(p?.pivot?.quantity ?? 1);
          const unit = Number(p?.pivot?.single_price ?? p?.pivot?.product_price ?? 0);
          return {
            productId: p?.pivot?.product_id ?? p?.id,
            title: p?.pivot?.product_name || p?.name,
            image: p?.product_thumbnail?.image_url || p?.product_thumbnail?.original_url,
            quantity: qty,
            price: unit,
            itemTotal: Number(p?.pivot?.subtotal ?? qty * unit),
            variation: p?.pivot?.variation_display_name || p?.variation_display_name || "",
            itemStatus: p?.pivot?.item_status || "",
            isReturnable: p?.pivot?.is_return ?? p?.is_return ?? p?.returnable ?? true,
            warranty: p?.warranty || "",
          };
        })
      : (order?.cart || []).map((c) => ({
          ...c,
          productId: c?.id,
          variation: "",
          itemStatus: "",
          isReturnable: true,
          warranty: "",
        }));

  const subTotal = Number(order?.subTotal ?? 0);
  const shippingCost = Number(order?.shippingCost ?? 0);
  const deliveryPrice = Number(order?.delivery_price ?? 0);
  const taxAmount = Number(order?.taxAmount ?? 0);
  const couponDiscount = Math.max(0, Math.abs(Number(order?.discount ?? 0)));
  const pointsUsed = Math.max(0, Math.abs(Number(order?.points_amount ?? 0)));
  const walletUsed = Math.max(0, Math.abs(Number(order?.wallet_balance ?? 0)));
  const grandBeforeDiscounts = subTotal + shippingCost + deliveryPrice + taxAmount;
  const total = Number(order?.total ?? 0);

  const handlePayNow = async () => {
    if (!payMethod) {
      notifyError("Please select a payment method");
      return;
    }
    setPaying(true);
    const { url, error: err } = await payOrderNow({
      orderNumber: order?.orderId || order?.invoice || orderId,
      paymentMethod: payMethod,
    });
    setPaying(false);
    if (err) {
      notifyError(err);
      return;
    }
    if (url) window.location.href = url;
  };

  return (
    <div>
      <Link
        href="/user/my-orders"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary mb-4"
      >
        <FiArrowLeft /> Back to My Orders
      </Link>

      {statusParam && ["success", "successful", "successfull"].includes(statusParam) && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 mb-4 text-sm font-semibold text-emerald-700">
          Payment successful — thank you for your order!
        </div>
      )}
      {statusParam && ["cancelled", "canceled"].includes(statusParam) && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-4 text-sm font-semibold text-red-700">
          Payment was cancelled.
        </div>
      )}
      {statusParam && ["failed", "failure", "error"].includes(statusParam) && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-4 text-sm font-semibold text-red-700">
          Payment failed. You can retry below.
        </div>
      )}

      {/* Title bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground">
              Order #{order?.orderId || orderId}
            </h1>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize ${statusBadgeClass(statusSlug)}`}
            >
              {String(statusName || "Pending").replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Placed on {showDateFormat(order?.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showPayNow && (
            <Button variant="create" onClick={() => setShowPay((v) => !v)}>
              <FiCreditCard className="mr-1.5" /> Pay Now
            </Button>
          )}
          <InvoiceDownloadButton data={order} globalSetting={globalSetting} />
        </div>
      </div>

      {showPay && (
        <div className="rounded-xl border border-border bg-card p-5 mb-6">
          <h4 className="font-semibold mb-3">Select Payment Method</h4>
          <CheckoutPaymentOptions
            methods={paymentMethods}
            value={payMethod}
            onChange={setPayMethod}
          />
          <div className="flex gap-3 mt-4">
            <Button onClick={handlePayNow} disabled={paying} variant="create">
              {paying ? "Processing..." : `Pay ${formatPrice(total)}`}
            </Button>
            <Button onClick={() => setShowPay(false)} variant="outline" disabled={paying}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Tracker */}
      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <OrderTracker statusSlug={statusSlug} statusName={statusName} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-3">Order Items</h3>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {items.length > 0 ? (
              items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-16 w-16 shrink-0 rounded-lg object-contain bg-muted border border-border"
                    />
                  ) : (
                    <div className="h-16 w-16 shrink-0 rounded-lg bg-muted border border-border" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground line-clamp-1">{item.title}</p>
                    {item.variation && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.variation}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Qty: {item.quantity}</span>
                      <span>{formatPrice(item.price)} each</span>
                      {item.itemStatus && (
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold capitalize ${statusBadgeClass(item.itemStatus)}`}>
                          {String(item.itemStatus).replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-foreground">{formatPrice(item.itemTotal)}</div>
                    {canReturnItem(statusSlug, item) &&
                      (returnedIds.includes(String(item.productId)) ? (
                        <span className="mt-1 inline-block text-[10px] font-semibold text-emerald-600">
                          Return submitted
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReturnItem(item)}
                          className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                        >
                          <FiRotateCcw size={11} /> Return
                        </button>
                      ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">No items found</div>
            )}
          </div>

          {/* Shipping / Billing / Payment info */}
          <h3 className="font-semibold text-foreground mb-3 mt-6">Order Information</h3>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {order?.user_info?.address && (
              <div className="flex items-start gap-3 p-4">
                <FiMapPin className="mt-0.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Delivery Address
                  </p>
                  <p className="text-sm text-foreground mt-0.5">{order.user_info.address}</p>
                </div>
              </div>
            )}
            {order?.delivery_description && (
              <div className="flex items-start gap-3 p-4">
                <FiTruck className="mt-0.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Delivery Method
                  </p>
                  <p className="text-sm text-foreground mt-0.5">{order.delivery_description}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-4">
              <FiCreditCard className="mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Payment Method
                </p>
                <p className="text-sm text-foreground mt-0.5 capitalize">
                  {String(order?.payment_method || "").replace(/_/g, " ") || "N/A"}
                  {paymentStatus && (
                    <span className="ml-2 text-xs font-semibold text-muted-foreground">
                      ({paymentStatus})
                    </span>
                  )}
                </p>
              </div>
            </div>
            {order?.note && (
              <div className="flex items-start gap-3 p-4">
                <FiFileText className="mt-0.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Note
                  </p>
                  <p className="text-sm text-foreground mt-0.5">{String(order.note)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Order Summary</h3>
          <div className="rounded-xl border border-border bg-card p-4 space-y-2.5 text-sm sticky top-20">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">{formatPrice(subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-foreground">{formatPrice(shippingCost)}</span>
            </div>
            {deliveryPrice > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium text-foreground">{formatPrice(deliveryPrice)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium text-foreground">{formatPrice(taxAmount)}</span>
              </div>
            )}
            <div className="border-t border-border pt-2.5 flex justify-between">
              <span className="text-muted-foreground">Grand Total</span>
              <span className="font-medium text-foreground">{formatPrice(grandBeforeDiscounts)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Coupon</span>
                <span>-{formatPrice(couponDiscount)}</span>
              </div>
            )}
            {pointsUsed > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Points Used</span>
                <span>-{formatPrice(pointsUsed)}</span>
              </div>
            )}
            {walletUsed > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Wallet Used</span>
                <span>-{formatPrice(walletUsed)}</span>
              </div>
            )}
            <div className="border-t border-border pt-2.5 flex justify-between text-base font-extrabold text-foreground">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <ReturnRequestModal
        open={!!returnItem}
        onClose={() => setReturnItem(null)}
        orderId={orderNumericId}
        item={returnItem}
        onSubmitted={markReturned}
      />
    </div>
  );
};

export default OrderDetailView;
