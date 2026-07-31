// Shared skeleton primitives for the user dashboard loading states.
// Plain elements with Tailwind `animate-pulse` so they render reliably
// inside Next.js `loading.jsx` Suspense fallbacks.

export const SkeletonBox = ({ className = "" }) => (
  <div className={`bg-muted rounded animate-pulse ${className}`} />
);

export const StatsCardsSkeleton = ({ count = 4 }) => (
  <div className="grid gap-4 mb-8 md:grid-cols-2 xl:grid-cols-4">
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 p-5 rounded-xl border border-border bg-muted/30"
      >
        <SkeletonBox className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBox className="h-3 w-24" />
          <SkeletonBox className="h-6 w-12" />
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 6, cols = 5 }) => (
  <div className="w-full overflow-hidden rounded-xl border border-border">
    <div className="flex items-center gap-4 px-5 py-4 border-b border-border bg-muted/40">
      {[...Array(cols)].map((_, i) => (
        <SkeletonBox key={i} className="h-4 flex-1" />
      ))}
    </div>
    {[...Array(rows)].map((_, r) => (
      <div
        key={r}
        className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0"
      >
        {[...Array(cols)].map((_, c) => (
          <SkeletonBox key={c} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const FormSkeleton = ({ fields = 6, withAvatar = false }) => (
  <div className="space-y-6">
    {withAvatar && (
      <div className="flex items-center gap-4">
        <SkeletonBox className="h-20 w-20 rounded-full" />
        <SkeletonBox className="h-10 w-32 rounded-lg" />
      </div>
    )}
    <div className="grid gap-5 sm:grid-cols-2">
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBox className="h-3 w-24" />
          <SkeletonBox className="h-11 w-full rounded-lg" />
        </div>
      ))}
    </div>
    <SkeletonBox className="h-12 w-40 rounded-lg" />
  </div>
);
