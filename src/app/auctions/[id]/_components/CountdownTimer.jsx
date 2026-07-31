"use client";

import { useEffect, useState } from "react";

const CountdownTimer = ({ endsAt, onExpired, large = false }) => {
  const calcRemaining = () =>
    Math.max(0, Math.floor((new Date(endsAt) - Date.now()) / 1000));

  const [secs, setSecs] = useState(calcRemaining());

  useEffect(() => {
    const initial = calcRemaining();
    setSecs(initial);
    if (initial === 0) {
      onExpired?.();
      return;
    }
    const id = setInterval(() => {
      const rem = calcRemaining();
      setSecs(rem);
      if (rem === 0) {
        clearInterval(id);
        onExpired?.();
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt]);

  if (secs === 0) {
    return <span className="font-bold text-muted-foreground">Auction Ended</span>;
  }

  const days = Math.floor(secs / 86400);
  const hours = Math.floor((secs % 86400) / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const ss = secs % 60;
  const fmt = (n) => String(n).padStart(2, "0");
  const isUrgent = secs < 600;

  return (
    <span
      className={`font-mono font-extrabold ${large ? "text-lg" : "text-sm"} ${isUrgent ? "text-red-500" : "text-foreground"}`}
    >
      {days > 0 && `${days}d `}
      {fmt(hours)}:{fmt(mins)}:{fmt(ss)}
    </span>
  );
};

export default CountdownTimer;
