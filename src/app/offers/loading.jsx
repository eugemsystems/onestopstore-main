import React from "react";
import "react-loading-skeleton/dist/skeleton.css";

//internal imports
import CMSkeletonTwo from "@components/preloader/CMSkeletonTwo";

export default function Loading() {
  return (
    <>
      <CMSkeletonTwo count={8} />
      <div className="h-14"></div>

      <div className="mx-auto max-w-screen-2xl px-4  sm:px-10">
        <div className="grid md:grid-cols-2 gap-1 lg:grid-cols-2">
          <CMSkeletonTwo count={6} width={90} />
          <CMSkeletonTwo count={6} width={90} />
        </div>
        <div className="h-10"></div>
        <div className="grid md:grid-cols-2 gap-2 lg:grid-cols-2">
          <CMSkeletonTwo count={6} width={90} />
          <CMSkeletonTwo count={6} width={90} />
        </div>
        <div className="h-20"></div>
      </div>
    </>
  );
}
