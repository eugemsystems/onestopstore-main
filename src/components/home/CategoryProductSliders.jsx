import { Suspense } from "react";
import { getPublishedProductSliders } from "@services/ProductSliderService";
import CategoryProductSliderSection from "./CategoryProductSliderSection";

/**
 * Server component — fetches published sliders and renders each as a product slider.
 * Receives `attributes` prop from parent (HomeModern) for ProductCard modals.
 */
const CategoryProductSliders = async ({ attributes }) => {
  const { sliders, error } = await getPublishedProductSliders();

  if (error || !sliders || sliders.length === 0) return null;

  return (
    <div className="bg-background">
      {sliders.map((slider) => (
        <div
          key={slider._id}
          className="border-b border-border/50 last:border-b-0"
        >
          <Suspense
            fallback={
              <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 py-10 animate-pulse">
                <div className="h-6 w-56 bg-muted rounded mb-6" />
                <div className="grid grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-64 bg-muted rounded-xl" />
                  ))}
                </div>
              </div>
            }
          >
            <CategoryProductSliderSection
              slider={slider}
              attributes={attributes}
            />
          </Suspense>
        </div>
      ))}
    </div>
  );
};

export default CategoryProductSliders;
