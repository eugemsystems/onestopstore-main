import { SkeletonBox } from "@components/preloader/DashboardSkeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonBox className="h-6 w-40 mb-6" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border p-4 space-y-3 bg-muted/30"
          >
            <SkeletonBox className="h-32 w-full rounded-lg" />
            <SkeletonBox className="h-4 w-3/4" />
            <SkeletonBox className="h-3 w-1/2" />
            <SkeletonBox className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
