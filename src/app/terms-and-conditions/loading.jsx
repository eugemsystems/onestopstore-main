import React from "react";
import "react-loading-skeleton/dist/skeleton.css";

//internal imports
import CMSkeletonTwo from "@components/preloader/CMSkeletonTwo";

export default function Loading() {
  return (
    <>
      <CMSkeletonTwo count={7} />

      <div className="h-10"></div>
      <div className="mx-auto max-w-screen-2xl px-4">
        <CMSkeletonTwo count={20} width={95} />
        <div className="h-10"></div>
        <CMSkeletonTwo count={20} width={95} />
      </div>
      <div className="h-20"></div>
      {/* <div className="rounded-md p-4 w-3/4 mx-auto">
        <div className="animate-pulse flex space-x-4 w-full">
          <div className="flex-1 space-y-6 py-1">
            <div className="space-y-3 w-full">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-muted rounded col-span-1"></div>
              </div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
}
