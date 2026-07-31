"use client";

import dynamic from "next/dynamic";
import React from "react";
import { useTimer } from "react-timer-hook";

const OfferTimer = ({ expiryTimestamp, darkGreen }) => {
  const { seconds, minutes, hours, days } = useTimer({ expiryTimestamp });

  return (
    <>
      <span
        className={`flex items-center justify-center ${
          darkGreen
            ? "bg-primary text-primary-foreground"
            : "bg-accent dark:text-foreground"
        } text-sm font-semibold px-2 py-1 rounded mx-1`}
      >
        {days < 10 ? `0${days}` : days}
      </span>
      :
      <span
        className={`flex items-center justify-center ${
          darkGreen
            ? "bg-primary text-primary-foreground"
            : "bg-accent dark:text-foreground"
        } text-sm font-semibold px-2 py-1 rounded mx-1`}
      >
        {hours < 10 ? `0${hours}` : hours}
      </span>
      :
      <span
        className={`flex items-center justify-center ${
          darkGreen
            ? "bg-primary text-primary-foreground"
            : "bg-accent dark:text-foreground"
        } text-sm font-semibold px-2 py-1 rounded mx-1`}
      >
        {minutes < 10 ? `0${minutes}` : minutes}
      </span>
      :
      <span
        className={`flex items-center justify-center ${
          darkGreen
            ? "bg-primary text-primary-foreground"
            : "bg-accent dark:text-foreground"
        } text-sm font-semibold px-2 py-1 rounded mx-1`}
      >
        {seconds < 10 ? `0${seconds}` : seconds}
      </span>
    </>
  );
};

export default dynamic(() => Promise.resolve(OfferTimer), {
  ssr: false,
});
