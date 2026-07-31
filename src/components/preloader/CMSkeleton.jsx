"use client";

import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import parse from "html-react-parser";
import { useLanguage } from "@context/LanguageContext";

const CMSkeleton = ({
  html,
  count,
  height,
  color,
  loading,
  error,
  data,
  highlightColor,
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

  return (
    <>
      {loading ? (
        <Skeleton
          count={count || 6}
          height={height || 25}
          baseColor={color || "#f1f5f9"}
          highlightColor={highlightColor || "#cbd5e1"}
        />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : data ? (
        html ? (
          parse(showingTranslateValue(data))
        ) : (
          showingTranslateValue(data)
        )
      ) : null}
    </>
  );
};

export default CMSkeleton;
