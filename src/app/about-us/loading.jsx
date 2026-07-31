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
        <div className="grid grid-cols-2 gap-1">
          <div className="my-auto">
            <CMSkeletonTwo count={10} width={90} />
            <div className="mt-4 grid grid-cols-2">
              <CMSkeletonTwo count={6} width={80} />
              <CMSkeletonTwo count={6} width={80} />
            </div>
            {/* <div className="h-10">
            <CMSkeletonTwo count={8} width={90} />
            <CMSkeletonTwo count={8} width={90} />
          </div> */}
          </div>
          <CMSkeletonTwo count={16} width={90} />
        </div>

        <div className="h-10"></div>
        <CMSkeletonTwo count={16} width={95} />
        <div className="h-20"></div>
        <CMSkeletonTwo count={3} width={30} textAlign />
        <div className="h-4"></div>
        <div className="grid grid-cols-6 gap-1">
          <CMSkeletonTwo count={6} width={75} />
          <CMSkeletonTwo count={6} width={75} />
          <CMSkeletonTwo count={6} width={75} />
          <CMSkeletonTwo count={6} width={75} />
          <CMSkeletonTwo count={6} width={75} />
          <CMSkeletonTwo count={6} width={75} />
        </div>
      </div>
      <div className="h-10"></div>
    </>
  );
}
