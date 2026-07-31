"use client";

import Link from "next/link";

export default function ProductError({ error, reset }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center bg-muted px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-red-100 mb-6">
          <svg
            className="w-10 h-10 text-red-600"
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
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Product Loading Error
        </h2>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t load this product. Please try again.
        </p>
        {process.env.NODE_ENV === "development" && error?.message && (
          <p className="text-sm text-red-600 mb-4 font-mono bg-red-50 p-3 rounded">
            {error.message}
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-muted"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
