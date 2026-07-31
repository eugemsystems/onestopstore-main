"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";

const CampaignCountdown = ({ endTime, startTime }) => {
  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const start = new Date(startTime).getTime();

    if (now < start) {
      const diff = start - now;
      return {
        status: "upcoming",
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    }

    if (now > end) {
      return { status: "expired", days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const diff = end - now;
    return {
      status: "active",
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  }, [endTime, startTime]);

  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  if (!timeLeft) {
    return <CountdownPlaceholder />;
  }

  if (timeLeft.status === "expired") {
    return (
      <div className="inline-flex items-center gap-1.5 text-red-500 text-sm font-medium">
        <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        Campaign Ended
      </div>
    );
  }

  const pad = (n) => String(n).padStart(2, "0");
  const isUpcoming = timeLeft.status === "upcoming";

  const units = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hrs" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Sec" },
  ];

  return (
    <div className="inline-flex items-center gap-1">
      {isUpcoming && (
        <span className="mr-0.5 sm:mr-1">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
        </span>
      )}
      {units.map((unit, i) => (
        <span key={unit.label} className="flex items-center gap-1">
          <span
            className={`flex flex-col items-center justify-center rounded-md sm:rounded-lg min-w-7 sm:min-w-10 h-8 sm:h-10 px-0.5 sm:px-1 ${
              isUpcoming ? "bg-orange-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            <span className="text-[11px] sm:text-sm font-bold leading-tight tabular-nums">
              {pad(unit.value)}
            </span>
            <span className="text-[7px] sm:text-[9px] font-medium leading-tight opacity-80 uppercase">
              {unit.label}
            </span>
          </span>
          {i < units.length - 1 && (
            <span
              className={`text-xs sm:text-base font-bold ${
                isUpcoming ? "text-orange-400" : "text-red-400"
              }`}
            >
              :
            </span>
          )}
        </span>
      ))}
    </div>
  );
};

const CountdownPlaceholder = () => {
  const units = ["Days", "Hrs", "Min", "Sec"];
  return (
    <div className="inline-flex items-center gap-1">
      {units.map((label, i) => (
        <span key={label} className="flex items-center gap-1">
          <span className="flex flex-col items-center justify-center rounded-md sm:rounded-lg min-w-7 sm:min-w-10 h-8 sm:h-10 px-0.5 sm:px-1 bg-red-500 text-white">
            <span className="text-[11px] sm:text-sm font-bold leading-tight">
              --
            </span>
            <span className="text-[7px] sm:text-[9px] font-medium leading-tight opacity-80 uppercase">
              {label}
            </span>
          </span>
          {i < units.length - 1 && (
            <span className="text-xs sm:text-base font-bold text-red-400">
              :
            </span>
          )}
        </span>
      ))}
    </div>
  );
};

export default CampaignCountdown;
