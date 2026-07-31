"use client";

import dayjs from "dayjs";
import Link from "next/link";
import {
  Package,
  Truck,
  MapPin,
  Phone,
  User,
  Calendar,
  Hash,
  ArrowLeft,
} from "lucide-react";

import TrackingTimeline from "@components/tracking/TrackingTimeline";
import RateDelivery from "@components/tracking/RateDelivery";

const TrackingPageClient = ({ trackingId, data, error, success }) => {
  if (!success || error) {
    return (
      <div className="text-center py-20">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {error || "We couldn't find an order with this tracking ID."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  const { order, tracking, deliveryBoy } = data;

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    "out-for-delivery": "bg-teal-100 text-teal-800",
    delivered: "bg-green-100 text-green-800",
    cancel: "bg-red-100 text-red-800",
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Track Your Order</h1>
        <p className="text-muted-foreground mt-1">
          Tracking ID:{" "}
          <span className="font-mono font-semibold text-primary">
            {trackingId}
          </span>
        </p>
      </div>

      {/* Order Summary Card */}
      <div className="bg-muted/50 border border-border rounded-xl p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-muted-foreground font-medium block mb-1">
              <Hash className="h-3 w-3 inline mr-1" />
              Invoice
            </span>
            <span className="font-semibold text-sm">#{order?.invoice}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block mb-1">
              <Calendar className="h-3 w-3 inline mr-1" />
              Order Date
            </span>
            <span className="font-semibold text-sm">
              {dayjs(order?.createdAt).format("MMM D, YYYY")}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block mb-1">
              Status
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                statusColors[order?.status?.toLowerCase()] ||
                "bg-gray-100 text-gray-800"
              }`}
            >
              {order?.status}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block mb-1">
              Total
            </span>
            <span className="font-bold text-lg text-primary">
              ${order?.total?.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Shipping Address */}
        {order?.user_info && (
          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground font-medium block mb-1">
              <MapPin className="h-3 w-3 inline mr-1" />
              Delivery Address
            </span>
            <p className="text-sm">
              {order.user_info.address}
              {order.city && `, ${order.city}`}
              {order.country && `, ${order.country}`}
              {order.zipCode && ` - ${order.zipCode}`}
            </p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Tracking Timeline - Left/Main */}
        <div className="md:col-span-2">
          <div className="bg-background border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Tracking History
            </h2>
            {tracking?.history && tracking.history.length > 0 ? (
              <TrackingTimeline history={tracking.history} />
            ) : (
              <p className="text-muted-foreground text-sm py-8 text-center">
                No tracking updates yet. We'll update this as your order
                progresses.
              </p>
            )}
          </div>

          {/* Rate Delivery - Show only for delivered orders */}
          {order?.status?.toLowerCase() === "delivered" &&
            order?.deliveryBoy && (
              <div className="mt-6">
                <RateDelivery
                  orderId={order._id}
                  existingRating={order.deliveryRating}
                />
              </div>
            )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Delivery Partner Info */}
          {deliveryBoy && (
            <div className="bg-background border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Delivery Partner
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {deliveryBoy.name?.en?.charAt(0) ||
                      deliveryBoy.name?.charAt?.(0) ||
                      "D"}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {deliveryBoy.name?.en || deliveryBoy.name}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {deliveryBoy.phone}
                    </p>
                  </div>
                </div>

                {/* Vehicle Info */}
                {deliveryBoy.vehicleType && (
                  <div className="text-xs text-muted-foreground bg-muted rounded-md p-2">
                    <span className="capitalize">
                      {deliveryBoy.vehicleType}
                    </span>
                    {deliveryBoy.vehicleNumber && (
                      <span className="ml-2 font-mono">
                        {deliveryBoy.vehicleNumber}
                      </span>
                    )}
                  </div>
                )}

                {/* Rating */}
                {deliveryBoy.averageRating > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-500">★</span>
                    <span className="font-medium">
                      {deliveryBoy.averageRating?.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">
                      ({deliveryBoy.totalRatings} ratings)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Estimated Delivery */}
          {tracking?.estimatedDeliveryTime && (
            <div className="bg-background border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Estimated Delivery
              </h3>
              <p className="text-lg font-bold text-primary">
                {dayjs(tracking.estimatedDeliveryTime).format("MMM D, YYYY")}
              </p>
              <p className="text-xs text-muted-foreground">
                {dayjs(tracking.estimatedDeliveryTime).format("h:mm A")}
              </p>
            </div>
          )}

          {/* Order Items Summary */}
          {order?.cart && order.cart.length > 0 && (
            <div className="bg-background border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-3">
                Order Items ({order.cart.length})
              </h3>
              <div className="space-y-2">
                {order.cart.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-muted-foreground truncate flex-1 mr-2">
                      {item.title?.en || item.title}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      x{item.quantity}
                    </span>
                  </div>
                ))}
                {order.cart.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{order.cart.length - 5} more items
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingPageClient;
