"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  MapPin,
  Star,
  Clock,
  ShoppingBag,
} from "lucide-react";

import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@lib/actions/notification.actions";
import { useState } from "react";

dayjs.extend(relativeTime);

const notificationIcons = {
  "order-placed": ShoppingBag,
  "order-confirmed": CheckCircle,
  processing: Clock,
  "delivery-assigned": Truck,
  "picked-up": Package,
  "in-transit": Truck,
  "out-for-delivery": MapPin,
  delivered: CheckCircle,
  "delivery-failed": XCircle,
  cancelled: XCircle,
  "status-update": Bell,
  "rating-reminder": Star,
};

const notificationColors = {
  "order-placed": "text-blue-500 bg-blue-50",
  "order-confirmed": "text-indigo-500 bg-indigo-50",
  processing: "text-yellow-500 bg-yellow-50",
  "delivery-assigned": "text-purple-500 bg-purple-50",
  "picked-up": "text-orange-500 bg-orange-50",
  "in-transit": "text-cyan-500 bg-cyan-50",
  "out-for-delivery": "text-teal-500 bg-teal-50",
  delivered: "text-green-500 bg-green-50",
  "delivery-failed": "text-red-500 bg-red-50",
  cancelled: "text-red-500 bg-red-50",
  "status-update": "text-gray-500 bg-gray-50",
  "rating-reminder": "text-yellow-500 bg-yellow-50",
};

const NotificationsList = ({ data, error }) => {
  const router = useRouter();
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleMarkRead = async (notificationId) => {
    await markNotificationRead(notificationId);
    router.refresh();
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    await markAllNotificationsRead();
    setIsMarkingAll(false);
    router.refresh();
  };

  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-semibold leading-none text-white bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="text-sm text-primary hover:underline disabled:opacity-50"
          >
            {isMarkingAll ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      {error ? (
        <div className="text-center py-16">
          <p className="text-red-500">{error}</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h4 className="font-medium text-muted-foreground">
            No notifications yet
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            You'll receive notifications when there are updates to your orders.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.type] || Bell;
            const colorClass =
              notificationColors[notification.type] ||
              "text-gray-500 bg-gray-50";
            const isUnread = notification.status === "unread";

            return (
              <div
                key={notification._id}
                className={`flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                  isUnread
                    ? "bg-primary/5 border-primary/20"
                    : "bg-background border-border hover:bg-muted/50"
                }`}
                onClick={() => {
                  if (isUnread) {
                    handleMarkRead(notification._id);
                  }
                  if (notification.trackingId) {
                    router.push(`/track/${notification.trackingId}`);
                  }
                }}
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${colorClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm ${
                        isUnread ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {notification.title}
                    </p>
                    {isUnread && (
                      <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <time className="text-xs text-muted-foreground">
                      {dayjs(notification.createdAt).fromNow()}
                    </time>
                    {notification.trackingId && (
                      <span className="text-xs font-mono text-primary">
                        {notification.trackingId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination - Simple */}
      {data?.totalDoc > 20 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from(
            { length: Math.ceil(data.totalDoc / 20) },
            (_, i) => i + 1,
          ).map((page) => (
            <Link
              key={page}
              href={`?page=${page}`}
              className="inline-flex items-center justify-center h-8 w-8 text-sm rounded-md border border-border hover:bg-muted"
            >
              {page}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
