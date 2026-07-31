import React from "react";
import "react-loading-skeleton/dist/skeleton.css";

//internal imports
import CMSkeletonTwo from "@components/preloader/CMSkeletonTwo";

export default function Loading() {
  return (
    <>
      <CMSkeletonTwo count={7} />
      <div className="h-10"></div>
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
        <CMSkeletonTwo count={20} width={95} />
        <div className="h-10"></div>
        <CMSkeletonTwo count={20} width={95} />
      </div>
      <div className="h-10"></div>
    </>
  );
}
