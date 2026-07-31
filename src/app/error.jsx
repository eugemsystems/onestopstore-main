"use client"; // Error components must be Client Components

import { useEffect } from "react";
import Link from "next/link";

const Error = ({ error, reset }) => {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-lg w-full text-center">
        {/* Error Icon */}
        <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-8">
          <svg
            className="w-12 h-12 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-foreground dark:text-white mb-4">
          Oops! Something went wrong
        </h1>
        <p className="text-muted-foreground dark:text-muted-foreground mb-8">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === "development" && error?.message && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8 text-left">
            <p className="text-sm font-mono text-red-800 dark:text-red-300 break-words">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-muted hover:bg-accent dark:bg-muted dark:hover:bg-accent text-foreground dark:text-white font-medium rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go Home
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-8">
          If this problem persists, please{" "}
          <Link
            href="/contact-us"
            className="text-primary hover:text-primary underline"
          >
            contact our support team
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Error;
