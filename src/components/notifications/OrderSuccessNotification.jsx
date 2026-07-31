"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiCheckCircle,
  FiPackage,
  FiNavigation,
  FiX,
  FiShoppingBag,
  FiBell,
} from "react-icons/fi";

const OrderSuccessNotification = ({
  show,
  onClose,
  orderId,
  invoice,
  total,
  trackingId,
  currency = "$",
}) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (show) {
      // Small delay for mount animation
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const handleTrackOrder = () => {
    handleClose();
    if (trackingId) {
      router.push(`/track/${trackingId}`);
    } else {
      router.push(`/order/${orderId}`);
    }
  };

  const handleViewNotifications = () => {
    handleClose();
    router.push("/user/notifications");
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-9999 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible && !isExiting ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-10000 flex items-center justify-center p-4">
        <div
          className={`relative w-full max-w-md transform overflow-hidden rounded-3xl bg-card shadow-2xl transition-all duration-500 ${
            isVisible && !isExiting
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-90 opacity-0 translate-y-4"
          }`}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <FiX size={18} />
          </button>

          {/* Success header */}
          <div className="relative bg-primary px-6 py-10 text-center">
            {/* Confetti dots */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-pulse rounded-full"
                  style={{
                    width: `${4 + Math.random() * 6}px`,
                    height: `${4 + Math.random() * 6}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: [
                      "#fbbf24",
                      "#f472b6",
                      "#60a5fa",
                      "#a78bfa",
                      "#34d399",
                      "#fb923c",
                    ][i % 6],
                    opacity: 0.4 + Math.random() * 0.4,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            {/* Check icon */}
            <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary-foreground/20" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/30">
                <FiCheckCircle size={40} className="text-primary-foreground" />
              </div>
            </div>

            <h2 className="relative text-2xl font-bold text-primary-foreground">
              Order Confirmed! 🎉
            </h2>
            <p className="relative mt-2 text-sm text-primary-foreground/80">
              Your order has been placed successfully
            </p>
          </div>

          {/* Order details */}
          <div className="px-6 py-5">
            <div className="space-y-2 rounded-2xl bg-muted/50 p-4">
              {invoice && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Invoice
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    #{invoice}
                  </span>
                </div>
              )}
              {total && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Total
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {currency}
                    {parseFloat(total).toFixed(2)}
                  </span>
                </div>
              )}
              {trackingId && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Tracking ID
                  </span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-teal-600">
                    <FiNavigation size={12} />
                    {trackingId}
                  </span>
                </div>
              )}
            </div>

            {/* Notification hint */}
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3">
              <FiBell className="mt-0.5 shrink-0 text-primary" size={16} />
              <p className="text-xs leading-5 text-primary">
                You'll receive notifications for every delivery update. Check
                them from your{" "}
                <button
                  onClick={handleViewNotifications}
                  className="font-semibold underline hover:text-primary/80"
                >
                  notifications page
                </button>
                .
              </p>
            </div>

            {/* Action buttons */}
            <div className="mt-5 space-y-3">
              <button
                onClick={handleTrackOrder}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                <FiNavigation size={16} />
                {trackingId ? "Track Your Order" : "View Order Details"}
              </button>
              <button
                onClick={handleClose}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-[0.98]"
              >
                <FiShoppingBag size={16} />
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccessNotification;
