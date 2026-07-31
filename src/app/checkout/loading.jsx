import React from "react";
import "react-loading-skeleton/dist/skeleton.css";

//internal imports
import CMSkeletonTwo from "@components/preloader/CMSkeletonTwo";

export default function Loading() {
  return (
    <>
      <div className="mx-auto max-w-screen-2xl px-4  sm:px-10">
        <div className="h-10"></div>
        <div className="grid md:grid-cols-2 gap-2 lg:grid-cols-2">
          <CMSkeletonTwo count={26} width={100} />
          <CMSkeletonTwo count={20} width={80} />
        </div>
        <div className="h-20"></div>
      </div>
    </>
  );
}
