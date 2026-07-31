"use client";

import React from "react";
import { cn } from "@lib/utils";

const AuthButton = ({
  type = "submit",
  disabled = false,
  loading = false,
  loadingText = "Loading...",
  children,
  className,
  variant = "primary", // primary, secondary, outline
  ...props
}) => {
  const baseStyles =
    "w-full h-10 font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center";

  const variants = {
    primary:
      "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
    gradient:
      "bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary text-white shadow-lg shadow-primary/25",
    secondary:
      "bg-muted hover:bg-muted text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    outline:
      "border-2 border-primary text-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default AuthButton;
