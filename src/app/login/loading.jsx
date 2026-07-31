import React from "react";
import "react-loading-skeleton/dist/skeleton.css";

//internal imports
import CMSkeletonTwo from "@components/preloader/CMSkeletonTwo";

export default function Loading() {
  return (
    <>
      <div className="h-10"></div>

      <CMSkeletonTwo count={22} width={40} />
      <div className="h-10"></div>
    </>
  );
}
