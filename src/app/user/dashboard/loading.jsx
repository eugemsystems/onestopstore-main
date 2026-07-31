import {
  SkeletonBox,
  StatsCardsSkeleton,
  TableSkeleton,
} from "@components/preloader/DashboardSkeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonBox className="h-6 w-40 mb-5" />
      <StatsCardsSkeleton count={4} />
      <SkeletonBox className="h-5 w-32 mb-4" />
      <TableSkeleton rows={5} cols={5} />
    </div>
  );
}
