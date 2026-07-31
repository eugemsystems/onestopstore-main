import {
  SkeletonBox,
  TableSkeleton,
} from "@components/preloader/DashboardSkeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonBox className="h-6 w-40 mb-5" />
      <TableSkeleton rows={8} cols={5} />
    </div>
  );
}
