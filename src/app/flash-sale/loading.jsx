import React from "react";
import "react-loading-skeleton/dist/skeleton.css";

//internal imports
import CMSkeletonTwo from "@components/preloader/CMSkeletonTwo";

export default function Loading() {
  return (
    <>
      <CMSkeletonTwo count={8} />
      <div className="h-14"></div>

      <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border p-4 animate-pulse"
            >
              <div className="aspect-square bg-muted rounded-lg mb-3"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3 mb-3"></div>
              <div className="h-2 bg-muted rounded-full mb-2"></div>
              <div className="h-10 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
