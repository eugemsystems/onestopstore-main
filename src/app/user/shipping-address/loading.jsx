import {
  SkeletonBox,
  FormSkeleton,
} from "@components/preloader/DashboardSkeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonBox className="h-6 w-48 mb-6" />
      <FormSkeleton fields={8} />
    </div>
  );
}
