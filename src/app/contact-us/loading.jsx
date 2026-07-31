import React from "react";
import "react-loading-skeleton/dist/skeleton.css";

//internal imports
import CMSkeletonTwo from "@components/preloader/CMSkeletonTwo";

export default function Loading() {
  return (
    <>
      <CMSkeletonTwo count={7} />
      <div className="h-20"></div>

      <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
        <div className="grid md:grid-cols-3 gap-2 lg:grid-cols-3">
          <CMSkeletonTwo count={10} width={85} />
          <CMSkeletonTwo count={10} width={85} />
          <CMSkeletonTwo count={10} width={85} />
        </div>
        <div className="h-20"></div>

        <div className="grid grid-cols-2 gap-2 xl:gap-8">
          <div className="my-auto">
            <CMSkeletonTwo count={14} width={90} />
          </div>
          <CMSkeletonTwo count={16} width={90} />
        </div>
        <div className="h-20"></div>
      </div>
    </>
  );
}
