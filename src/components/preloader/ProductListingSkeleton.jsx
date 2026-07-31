const Pulse = ({ className = "" }) => (
  <div className={`rounded-md bg-muted animate-pulse ${className}`} />
);

/**
 * Skeleton matching search / shop listing layout:
 * breadcrumb, category pills, sidebar filters, product grid.
 */
const ProductListingSkeleton = () => {
  return (
    <div className="bg-background min-h-[70vh]">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 py-6 lg:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Pulse className="h-4 w-12" />
          <Pulse className="h-3 w-3 rounded-full" />
          <Pulse className="h-4 w-20" />
        </div>

        {/* Title + count */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <Pulse className="h-8 w-56" />
          <Pulse className="h-4 w-28" />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-hidden mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Pulse key={i} className="h-9 w-24 rounded-full shrink-0" />
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-6">
            <div className="space-y-3">
              <Pulse className="h-5 w-28" />
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Pulse className="h-4 w-32" />
                  <Pulse className="h-4 w-8" />
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-4 border-t border-border">
              <Pulse className="h-5 w-20" />
              <Pulse className="h-2 w-full rounded-full" />
              <div className="flex gap-2">
                <Pulse className="h-9 flex-1 rounded-lg" />
                <Pulse className="h-9 flex-1 rounded-lg" />
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-border">
              <Pulse className="h-5 w-16" />
              {[1, 2, 3, 4, 5].map((i) => (
                <Pulse key={i} className="h-4 w-28" />
              ))}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <Pulse className="h-9 w-28 rounded-lg lg:hidden" />
              <div className="flex items-center gap-2 ml-auto">
                <Pulse className="h-9 w-36 rounded-lg" />
                <Pulse className="h-9 w-20 rounded-lg" />
              </div>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border overflow-hidden bg-card"
                >
                  <Pulse className="aspect-square w-full rounded-none" />
                  <div className="p-3 space-y-2">
                    <Pulse className="h-4 w-4/5" />
                    <Pulse className="h-3 w-20" />
                    <div className="flex items-center justify-between pt-1">
                      <Pulse className="h-5 w-16" />
                      <Pulse className="h-9 w-9 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load more / pagination */}
            <div className="flex justify-center mt-10">
              <Pulse className="h-11 w-40 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListingSkeleton;
