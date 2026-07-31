"use client";

import Link from "next/link";

/**
 * Reusable Error Display Component
 * @param {Object} props
 * @param {string} props.error - Error message to display
 * @param {string} props.title - Title of the error (default: "Error")
 * @param {boolean} props.showRetry - Whether to show retry button
 * @param {function} props.onRetry - Retry callback function
 * @param {boolean} props.showHomeLink - Whether to show home link
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 */
export default function ErrorDisplay({
  error,
  title = "Something went wrong",
  showRetry = false,
  onRetry,
  showHomeLink = false,
  size = "md",
}) {
  const sizeClasses = {
    sm: "min-h-[200px] p-4",
    md: "min-h-[300px] p-6",
    lg: "min-h-[400px] p-8",
  };

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${sizeClasses[size]}`}
    >
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md w-full text-center shadow-sm">
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <svg
            className={`text-red-600 dark:text-red-400 ${iconSizes[size]}`}
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

        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          {title}
        </h3>

        {error && (
          <p className="text-red-600 dark:text-red-300 text-sm mb-4">{error}</p>
        )}

        {(showRetry || showHomeLink) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
            )}

            {showHomeLink && (
              <Link
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 bg-muted hover:bg-accent dark:bg-muted dark:hover:bg-accent text-foreground dark:text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Empty State Component
 */
export function EmptyState({
  title = "No data found",
  description = "There's nothing to display here yet.",
  icon,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-muted dark:bg-muted mb-4">
        {icon || (
          <svg
            className="w-8 h-8 text-muted-foreground dark:text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground dark:text-muted-foreground text-sm mb-4 max-w-sm">
        {description}
      </p>
      {action}
    </div>
  );
}

/**
 * Loading Error Component - for when loading fails
 */
export function LoadingError({ message, onRetry }) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
        <svg
          className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0"
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
        <span className="text-sm text-amber-800 dark:text-amber-200">
          {message || "Failed to load"}
        </span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-2 text-sm text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 underline"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
