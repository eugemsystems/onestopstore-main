"use client";

import SearchScreen from "@components/search/SearchScreen";
import SearchScreenNew from "@components/search/SearchScreenNew";
import SearchScreenClothing from "@components/search/SearchScreenClothing";
import SearchScreenElectronic from "@components/search/SearchScreenElectronic";

export default function SearchClient({
  products,
  attributes,
  categories,
  searchQuery,
  selectedCategory,
  initialSort = "",
  initialRating = "",
  minPrice = "",
  maxPrice = "",
  totalDoc = 0,
  page = 1,
  hasMore = false,
  error,
  storeLayout = "default",
  basePath = "/search",
}) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md w-full text-center">
          <svg
            className="w-12 h-12 text-red-500 mx-auto mb-4"
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
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
            Search Error
          </h3>
          <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const commonProps = {
    products,
    attributes,
    categories,
    searchQuery,
    selectedCategory,
    initialSort,
    initialRating,
    minPrice,
    maxPrice,
    totalDoc,
    page,
    hasMore,
    basePath,
  };

  if (storeLayout === "clothing") {
    return <SearchScreenClothing {...commonProps} />;
  }

  if (storeLayout === "electronic" || storeLayout === "modern") {
    return <SearchScreenElectronic {...commonProps} />;
  }

  return <SearchScreenNew {...commonProps} />;
}
