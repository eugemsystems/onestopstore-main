"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useLanguage } from "@context/LanguageContext";

const CMSkeletonTwo = ({
  count,
  height,
  width,
  color,
  highlightColor,
  textAlign,
  loading,
  error,
  data,
}) => {
  const { lang } = useLanguage();

  const showingTranslateValue = (data) => {
    if (!data) return "";
    const updatedData =
      data !== undefined && Object?.keys(data).includes(lang)
        ? data[lang]
        : data?.en;
    return updatedData || "";
  };

  // If loading, show skeleton
  if (loading) {
    return (
      <span
        className={`inline-block w-full ${
          textAlign ? "text-right" : "text-center"
        }`}
      >
        <Skeleton
          count={count || 6}
          height={height || 22}
          width={`${width}%` || "100%"}
          baseColor={color || "#f1f5f9"}
          highlightColor={highlightColor || "#cbd5e1"}
          inline={true}
        />
      </span>
    );
  }

  // If error, show error message
  if (error) {
    return <span className="text-center mx-auto text-red-500">{error}</span>;
  }

  // If data exists, show the data
  if (data) {
    return <>{showingTranslateValue(data)}</>;
  }

  // Default: return null if no data
  return null;
};

export default CMSkeletonTwo;
