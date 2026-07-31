import { Suspense } from "react";
import Link from "next/link";
import StickyCart from "@components/cart/StickyCart";
import ProductCard from "@components/product/ProductCard";
import CMSkeletonTwo from "@components/preloader/CMSkeleton";
import FeatureCategory from "@components/category/FeatureCategory";
import DiscountedCard from "@components/product/DiscountedCard";
import CampaignSection from "@components/campaign/CampaignSection";
import CategoryProductSliders from "@components/home/CategoryProductSliders";

const HomeMinimal = ({
  popularProducts,
  discountedProducts,
  attributes,
  storeCustomizationSetting,
  storeCustomizationError,
  globalSetting,
  featuredCampaign,
}) => {
  return (
    <div className="min-h-screen bg-background">
      <StickyCart />

      {/* Minimal hero — text-focused */}
      <div className="mx-auto max-w-screen-xl px-4 sm:px-10 py-16 lg:py-24 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          {globalSetting?.shop_name || "Welcome to Our Store"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          {globalSetting?.site_description ||
            "Discover quality products curated just for you."}
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Shop All Products
          </Link>
          <Link
            href="#popular"
            className="inline-flex items-center px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
          >
            Browse Popular
          </Link>
        </div>
      </div>

      {/* Category pills */}
      {storeCustomizationSetting?.home?.featured_status && (
        <div className="border-y border-border py-10">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-10">
            <h2 className="text-lg font-semibold mb-6 text-center">
              <CMSkeletonTwo
                count={1}
                height={24}
                loading={false}
                error={storeCustomizationError}
                data={storeCustomizationSetting?.home?.feature_title}
              />
            </h2>
            <Suspense fallback={<p>Loading categories...</p>}>
              <FeatureCategory />
            </Suspense>
          </div>
        </div>
      )}

      {/* Popular products — clean 3-column grid */}
      {storeCustomizationSetting?.home?.popular_products_status && (
        <div id="popular" className="py-16">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-10">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold">
                <CMSkeletonTwo
                  count={1}
                  height={30}
                  loading={false}
                  error={storeCustomizationError}
                  data={storeCustomizationSetting?.home?.popular_title}
                />
              </h2>
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                <CMSkeletonTwo
                  count={1}
                  height={16}
                  loading={false}
                  error={storeCustomizationError}
                  data={storeCustomizationSetting?.home?.popular_description}
                />
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {popularProducts
                ?.slice(
                  0,
                  Number(storeCustomizationSetting?.home?.popular_product_limit) || 9,
                )
                .map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    attributes={attributes}
                  />
                ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
              >
                View All Products →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Campaign / Flash Sale Section */}
      {storeCustomizationSetting?.home?.campaign_home_status !== false &&
        featuredCampaign && (
        <CampaignSection campaign={featuredCampaign} attributes={attributes} />
      )}

      {/* Category-wise Product Sliders (admin controlled) */}
      <Suspense fallback={null}>
        <CategoryProductSliders attributes={attributes} />
      </Suspense>

      {/* Discounted products */}
      {storeCustomizationSetting?.home?.discount_product_status &&
        discountedProducts?.length > 0 && (
          <div
            id="discount"
            className="bg-muted/50 dark:bg-muted/30 py-16 border-t border-border/50"
          >
            <div className="mx-auto max-w-screen-xl px-4 sm:px-10">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold">
                  <CMSkeletonTwo
                    count={1}
                    height={30}
                    loading={false}
                    error={storeCustomizationError}
                    data={
                      storeCustomizationSetting?.home?.latest_discount_title
                    }
                  />
                </h2>
                <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                  <CMSkeletonTwo
                    count={1}
                    height={16}
                    loading={false}
                    error={storeCustomizationError}
                    data={
                      storeCustomizationSetting?.home
                        ?.latest_discount_description
                    }
                  />
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {discountedProducts
                  ?.slice(
                    0,
                    Number(storeCustomizationSetting?.home?.latest_discount_product_limit) || 9,
                  )
                  .map((product) => (
                    <DiscountedCard
                      key={product._id}
                      product={product}
                      attributes={attributes}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default HomeMinimal;
