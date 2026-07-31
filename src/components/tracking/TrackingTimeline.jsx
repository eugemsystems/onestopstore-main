"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  CheckCircle,
  Clock,
  Package,
  Truck,
  MapPin,
  ShoppingBag,
  XCircle,
  RotateCcw,
  Home,
  Box,
} from "lucide-react";

dayjs.extend(relativeTime);

const statusConfig = {
  "order-placed": {
    icon: ShoppingBag,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-500",
  },
  "order-confirmed": {
    icon: CheckCircle,
    color: "text-indigo-500",
    bgColor: "bg-indigo-100",
    borderColor: "border-indigo-500",
  },
  processing: {
    icon: Clock,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-500",
  },
  "ready-for-pickup": {
    icon: Box,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-500",
  },
  "picked-up": {
    icon: Package,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-500",
  },
  "in-transit": {
    icon: Truck,
    color: "text-cyan-500",
    bgColor: "bg-cyan-100",
    borderColor: "border-cyan-500",
  },
  "out-for-delivery": {
    icon: MapPin,
    color: "text-teal-500",
    bgColor: "bg-teal-100",
    borderColor: "border-teal-500",
  },
  delivered: {
    icon: Home,
    color: "text-green-500",
    bgColor: "bg-green-100",
    borderColor: "border-green-500",
  },
  "delivery-failed": {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-100",
    borderColor: "border-red-500",
  },
  returned: {
    icon: RotateCcw,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-500",
  },
};

const TrackingTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) return null;

  // Reverse so the most recent is on top
  const sortedHistory = [...history].reverse();

  return (
    <div className="relative">
      {sortedHistory.map((item, index) => {
        const config =
          statusConfig[item.status] || statusConfig["order-placed"];
        const Icon = config.icon;
        const isFirst = index === 0;

        return (
          <div key={index} className="relative flex items-start pb-6 last:pb-0">
            {/* Vertical line */}
            {index < sortedHistory.length - 1 && (
              <div className="absolute left-5 top-10 w-0.5 h-full -ml-px bg-border" />
            )}

            {/* Icon */}
            <div
              className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                isFirst
                  ? `${config.bgColor} ${config.borderColor}`
                  : "bg-muted border-border"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${isFirst ? config.color : "text-muted-foreground"}`}
              />
            </div>

            {/* Content */}
            <div className="ml-4 min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p
                  className={`text-sm font-semibold capitalize ${
                    isFirst ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.status?.replace(/-/g, " ")}
                </p>
                <time className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {dayjs(item.timestamp).fromNow()}
                </time>
              </div>
              {item.message && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {item.message}
                </p>
              )}
              {item.location && (
                <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {item.location}
                </p>
              )}
              <time className="text-xs text-muted-foreground">
                {dayjs(item.timestamp).format("MMM D, YYYY h:mm A")}
              </time>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TrackingTimeline;
