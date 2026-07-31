const Pulse = ({ className = "" }) => (
  <div className={`rounded-md bg-muted animate-pulse ${className}`} />
);

const ProductSlugSkeleton = () => {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-3 sm:px-10 max-w-screen-2xl py-4 lg:py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Pulse className="h-4 w-12" />
          <Pulse className="h-3 w-3 rounded-full" />
          <Pulse className="h-4 w-24" />
          <Pulse className="h-3 w-3 rounded-full" />
          <Pulse className="h-4 w-40" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 lg:gap-x-8 mb-16">
          {/* Image gallery */}
          <div className="lg:col-span-3 space-y-4">
            <Pulse className="aspect-square w-full rounded-xl" />
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Pulse key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>

          {/* Product details */}
          <div className="lg:col-span-4 space-y-5">
            <Pulse className="h-8 w-4/5 max-w-lg" />
            <div className="flex items-center gap-3">
              <Pulse className="h-4 w-24" />
              <Pulse className="h-4 w-16" />
            </div>
            <Pulse className="h-10 w-32" />
            <Pulse className="h-4 w-full max-w-md" />
            <Pulse className="h-4 w-full max-w-sm" />
            <div className="flex gap-3 pt-2">
              <Pulse className="h-12 w-36 rounded-lg" />
              <Pulse className="h-12 w-36 rounded-lg" />
            </div>
            <div className="space-y-2 pt-4 border-t border-border">
              <Pulse className="h-4 w-full" />
              <Pulse className="h-4 w-11/12" />
              <Pulse className="h-4 w-10/12" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-border pt-8 mb-12">
          <div className="flex gap-6 mb-6">
            <Pulse className="h-5 w-24" />
            <Pulse className="h-5 w-20" />
            <Pulse className="h-5 w-28" />
          </div>
          <div className="space-y-3">
            <Pulse className="h-4 w-full" />
            <Pulse className="h-4 w-full" />
            <Pulse className="h-4 w-3/4" />
          </div>
        </div>

        {/* Related products */}
        <div className="mb-10">
          <Pulse className="h-7 w-48 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-3">
                <Pulse className="aspect-square w-full rounded-xl" />
                <Pulse className="h-4 w-3/4" />
                <Pulse className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSlugSkeleton;
