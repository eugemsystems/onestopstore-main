import { SkeletonBox } from "@components/preloader/DashboardSkeleton";

export default function Loading() {
  return (
    <div>
      <div className="grid gap-4 mb-8 sm:grid-cols-2 grid-cols-1">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="flex items-center border border-border w-full rounded-xl p-5 bg-muted/30"
          >
            <SkeletonBox className="h-16 w-16 rounded-full mr-4" />
            <div className="flex-1 space-y-2">
              <SkeletonBox className="h-4 w-32" />
              <SkeletonBox className="h-3 w-40" />
              <SkeletonBox className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
