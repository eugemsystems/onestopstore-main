/**
 * Layout-aware homepage skeletons.
 * Pure Tailwind (animate-pulse) server-renderable blocks — no client JS —
 * shaped to mirror each store layout's real sections so the first paint
 * matches what will load in.
 */

const Box = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

const Circle = ({ className = "" }) => (
  <div className={`animate-pulse rounded-full bg-gray-200 ${className}`} />
);

const ProductCard = () => (
  <div className="rounded-lg border border-gray-100 p-3">
    <Box className="mb-3 aspect-square w-full" />
    <Box className="mb-2 h-3 w-3/4" />
    <Box className="mb-3 h-3 w-1/2" />
    <div className="flex items-center justify-between">
      <Box className="h-4 w-16" />
      <Circle className="h-8 w-8" />
    </div>
  </div>
);

const ProductGrid = ({ count = 10, cols = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5", gap = "gap-3" }) => (
  <div className={`grid ${cols} ${gap}`}>
    {Array.from({ length: count }).map((_, i) => (
      <ProductCard key={i} />
    ))}
  </div>
);

const CenteredHeader = () => (
  <div className="mx-auto mb-8 flex w-full flex-col items-center lg:w-2/5">
    <Box className="mb-3 h-6 w-48" />
    <Box className="h-3 w-72" />
  </div>
);

const LeftHeader = () => (
  <div className="mb-8 flex items-end justify-between">
    <div>
      <Box className="mb-3 h-6 w-44" />
      <Box className="h-3 w-64" />
    </div>
    <Box className="hidden h-9 w-24 rounded-full sm:block" />
  </div>
);

const CategoryTiles = ({ count = 12 }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 rounded-lg border border-gray-100 p-4"
      >
        <Circle className="h-10 w-10 shrink-0" />
        <Box className="h-3 w-20" />
      </div>
    ))}
  </div>
);

/* ── Default: hero slider + coupons, promo strip, categories, products ── */
const DefaultSkeleton = () => (
  <div className="bg-background">
    <div className="mx-auto max-w-screen-2xl px-3 py-5 sm:px-10">
      <div className="flex flex-col gap-4 lg:flex-row">
        <Box className="h-64 w-full sm:h-96 lg:w-3/5" />
        <div className="hidden flex-col gap-3 lg:flex lg:w-2/5">
          <Box className="h-10 w-1/2" />
          <Box className="h-40 w-full" />
          <Box className="h-40 w-full" />
        </div>
      </div>
      <Box className="mt-6 h-20 w-full rounded-xl" />
    </div>

    <div className="border-y border-gray-100 bg-muted/50 py-10 lg:py-16">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
        <CenteredHeader />
        <CategoryTiles />
      </div>
    </div>

    <div className="py-10 lg:py-16">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
        <CenteredHeader />
        <ProductGrid count={10} cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6" />
      </div>
    </div>
  </div>
);

/* ── Modern: tall gradient hero, category card row, promo trio, products ── */
const ModernSkeleton = () => (
  <div className="bg-background">
    <div className="mx-auto max-w-screen-2xl px-3 py-8 sm:px-10">
      <div className="flex min-h-[420px] items-center gap-8 lg:min-h-[520px]">
        <div className="w-full space-y-4 lg:w-2/5">
          <Box className="h-4 w-32" />
          <Box className="h-10 w-full" />
          <Box className="h-10 w-4/5" />
          <Box className="h-3 w-3/4" />
          <div className="flex gap-3 pt-2">
            <Box className="h-11 w-36 rounded-full" />
            <Box className="h-11 w-28 rounded-full" />
          </div>
        </div>
        <Box className="hidden h-80 flex-1 lg:block" />
        <Box className="hidden h-72 w-72 shrink-0 rounded-xl xl:block" />
      </div>
    </div>

    <div className="mx-auto max-w-screen-2xl px-3 py-8 sm:px-10">
      <LeftHeader />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Box key={i} className="h-44 w-full rounded-xl" />
        ))}
      </div>
    </div>

    <div className="mx-auto max-w-screen-2xl px-4 pb-10 sm:px-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Box key={i} className="min-h-[240px] w-full rounded-xl" />
        ))}
      </div>
    </div>

    <div className="border-y border-gray-100 bg-muted/50 py-12">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
        <LeftHeader />
        <ProductGrid count={10} cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" gap="gap-4" />
      </div>
    </div>
  </div>
);

/* ── Minimal: centered text hero, categories, airy 3-col products ── */
const MinimalSkeleton = () => (
  <div className="bg-background">
    <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-10 lg:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center space-y-4">
        <Box className="h-10 w-4/5" />
        <Box className="h-10 w-3/5" />
        <Box className="h-3 w-2/3" />
        <div className="flex gap-3 pt-4">
          <Box className="h-11 w-36 rounded-full" />
          <Box className="h-11 w-36 rounded-full" />
        </div>
      </div>
    </div>

    <div className="border-y border-gray-100 py-10">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-10">
        <CenteredHeader />
        <CategoryTiles count={8} />
      </div>
    </div>

    <div className="py-16">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-10">
        <CenteredHeader />
        <ProductGrid count={6} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" gap="gap-6" />
        <div className="mt-10 flex justify-center">
          <Box className="h-11 w-40 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

/* ── Clothing: split hero, marquee bar, magazine mosaic, products ── */
const ClothingSkeleton = () => (
  <div className="bg-white">
    <div className="mx-auto grid max-w-screen-2xl grid-cols-1 lg:min-h-[520px] lg:grid-cols-2">
      <div className="flex flex-col justify-center space-y-4 bg-neutral-50 px-6 py-12 lg:px-16">
        <Box className="h-4 w-28" />
        <Box className="h-10 w-full" />
        <Box className="h-10 w-3/4" />
        <Box className="h-3 w-2/3" />
        <div className="flex gap-3 pt-4">
          <Box className="h-11 w-36" />
          <Box className="h-11 w-36" />
        </div>
      </div>
      <Box className="min-h-[300px] w-full rounded-none lg:min-h-full" />
    </div>

    <div className="w-full bg-neutral-900 py-3">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
        <Box className="h-4 w-full bg-neutral-700" />
      </div>
    </div>

    <div className="py-16 lg:py-24">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
        <CenteredHeader />
        <div className="grid grid-cols-12 gap-4">
          <Box className="col-span-12 h-64 sm:col-span-4 lg:h-80" />
          <Box className="col-span-6 h-64 sm:col-span-4 lg:h-80" />
          <Box className="col-span-6 h-64 sm:col-span-4 lg:h-80" />
          <Box className="col-span-12 h-56 sm:col-span-6" />
          <Box className="col-span-6 h-56 sm:col-span-3" />
          <Box className="col-span-6 h-56 sm:col-span-3" />
        </div>
      </div>
    </div>

    <div className="bg-neutral-50 py-16">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
        <LeftHeader />
        <ProductGrid count={8} cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" gap="gap-4" />
      </div>
    </div>
  </div>
);

/* ── Electronic: dark hero, icon strip, offer bar, products ── */
const ElectronicSkeleton = () => (
  <div className="bg-background">
    <div className="w-full bg-foreground">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-8 px-4 py-12 sm:px-10 lg:grid-cols-2 lg:py-20">
        <div className="space-y-4 self-center">
          <Box className="h-6 w-32 rounded-full bg-gray-600" />
          <Box className="h-10 w-full bg-gray-600" />
          <Box className="h-10 w-3/4 bg-gray-600" />
          <Box className="h-3 w-2/3 bg-gray-600" />
          <div className="flex gap-3 pt-3">
            <Box className="h-11 w-36 rounded-full bg-gray-600" />
            <Box className="h-11 w-28 rounded-full bg-gray-600" />
          </div>
        </div>
        <Box className="h-[300px] w-full rounded-2xl bg-gray-600 lg:h-[380px]" />
      </div>
    </div>

    <div className="border-b border-gray-100 py-8 lg:py-10">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
        <LeftHeader />
        <div className="grid grid-cols-4 gap-4 lg:grid-cols-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Box className="h-14 w-14 rounded-2xl" />
              <Box className="h-3 w-14" />
            </div>
          ))}
        </div>
      </div>
    </div>

    <Box className="h-12 w-full rounded-none" />

    <div className="py-14 lg:py-20">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
        <LeftHeader />
        <ProductGrid count={10} cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6" />
      </div>
    </div>
  </div>
);

const HomeSkeleton = ({ layout = "default" }) => {
  switch (layout) {
    case "modern":
      return <ModernSkeleton />;
    case "minimal":
      return <MinimalSkeleton />;
    case "clothing":
      return <ClothingSkeleton />;
    case "electronic":
      return <ElectronicSkeleton />;
    default:
      return <DefaultSkeleton />;
  }
};

export default HomeSkeleton;
