import { Suspense } from "react";
import Link from "next/link";
import StickyCart from "@components/cart/StickyCart";
import ProductCard from "@components/product/ProductCard";
import ModernHero from "./ModernHero";
import CMSkeletonTwo from "@components/preloader/CMSkeleton";
import FeatureCategoryModern from "@components/category/FeatureCategoryModern";
import DiscountedCard from "@components/product/DiscountedCard";
import CardTwo from "@components/cta-card/CardTwo";
import CampaignSection from "@components/campaign/CampaignSection";
import ModernBanner from "@components/banner/ModernBanner";
import CategoryProductSliders from "@components/home/CategoryProductSliders";

const HomeModern = ({
  popularProducts,
  discountedProducts,
  attributes,
  storeCustomizationSetting,
  storeCustomizationError,
  globalSetting,
  featuredCampaign,
}) => {
  return (
    <div className="min-h-screen">
      <StickyCart />

      {/* Full-width hero section */}
      {storeCustomizationSetting?.home?.modern_hero_status !== false && (
        <ModernHero
          discountedProducts={discountedProducts}
          attributes={attributes}
          storeCustomizationSetting={storeCustomizationSetting}
        />
      )}

      {/* Feature categories — horizontal scroll */}
      {storeCustomizationSetting?.home?.featured_status && (
        <div className="bg-background">
          <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  <CMSkeletonTwo
                    count={1}
                    height={30}
                    loading={false}
                    error={storeCustomizationError}
                    data={storeCustomizationSetting?.home?.feature_title}
                  />
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  <CMSkeletonTwo
                    count={1}
                    height={10}
                    loading={false}
                    error={storeCustomizationError}
                    data={storeCustomizationSetting?.home?.feature_description}
                  />
                </p>
              </div>
              <Link
                href="/search"
                className="text-sm font-medium text-primary hover:underline"
              >
                View All →
              </Link>
            </div>
            <Suspense fallback={<p>Loading categories...</p>}>
              <FeatureCategoryModern />
            </Suspense>
          </div>
          {/* Campaign / Flash Sale Section */}
          {storeCustomizationSetting?.home?.campaign_home_status !== false &&
            featuredCampaign && (
              <CampaignSection campaign={featuredCampaign} attributes={attributes} />
            )}
        </div>
      )}

      {/* Modern Banner Cards */}
      <ModernBanner storeCustomizationSetting={storeCustomizationSetting} />

      {/* Category-wise Product Sliders (admin controlled) */}
      <Suspense fallback={null}>
        <CategoryProductSliders attributes={attributes} />
      </Suspense>

      {/* Popular products — larger cards */}
      {storeCustomizationSetting?.home?.popular_products_status && (
        <div className="bg-muted/50 dark:bg-muted/30 py-12 border-y border-border/50">
          <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  <CMSkeletonTwo
                    count={1}
                    height={30}
                    loading={false}
                    error={storeCustomizationError}
                    data={storeCustomizationSetting?.home?.popular_title}
                  />
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  <CMSkeletonTwo
                    count={1}
                    height={10}
                    loading={false}
                    error={storeCustomizationError}
                    data={storeCustomizationSetting?.home?.popular_description}
                  />
                </p>
              </div>
              <Link
                href="/search"
                className="text-sm font-medium text-primary hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-4">
              {popularProducts
                ?.slice(
                  0,
                  Number(storeCustomizationSetting?.home?.popular_product_limit) || 10,
                )
                .map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    attributes={attributes}
                  />
                ))}
            </div>
          </div>
        </div>
      )}



      {/* Promotional banner — full width */}
      {storeCustomizationSetting?.home?.delivery_status && (
        <CardTwo />
      )}

      {/* Discounted products — 2-column feature layout */}
      {storeCustomizationSetting?.home?.discount_product_status &&
        discountedProducts?.length > 0 && (
          <div
            id="discount"
            className="bg-muted/50 dark:bg-muted/30 py-12 border-t border-border/50"
          >
            <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
              <div className="flex items-center justify-between mb-6">
                <div>
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
                  <p className="text-sm text-muted-foreground mt-1">
                    <CMSkeletonTwo
                      count={1}
                      height={10}
                      loading={false}
                      error={storeCustomizationError}
                      data={
                        storeCustomizationSetting?.home
                          ?.latest_discount_description
                      }
                    />
                  </p>
                </div>
                <Link
                  href="/search"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-4">
                {discountedProducts
                  ?.slice(
                    0,
                    Number(storeCustomizationSetting?.home?.latest_discount_product_limit) || 10,
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

export default HomeModern;
