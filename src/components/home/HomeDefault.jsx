import { Suspense } from "react";
import Banner from "@components/banner/Banner";
import CardTwo from "@components/cta-card/CardTwo";
import OfferCard from "@components/offer/OfferCard";
import StickyCart from "@components/cart/StickyCart";
import ProductCard from "@components/product/ProductCard";
import MainCarousel from "@components/carousel/MainCarousel";
import CMSkeletonTwo from "@components/preloader/CMSkeleton";
import FeatureCategory from "@components/category/FeatureCategory";
import DiscountedCard from "@components/product/DiscountedCard";
import CategoryProductSliders from "@components/home/CategoryProductSliders";
import {
  BestSellersRow,
  NewArrivalsRow,
  FlashSaleRow,
  CategoryDealsRow,
} from "@components/home/HomeProductRows";

const HomeDefault = ({
  popularProducts,
  discountedProducts,
  attributes,
  storeCustomizationSetting,
  storeCustomizationError,
}) => {
  return (
    <div className="min-h-screen bg-background">
      {/* sticky cart section */}
      <StickyCart />

      {/* Hero / Carousel Section */}
      <div className="bg-background">
        <div className="mx-auto py-5 max-w-screen-2xl px-3 sm:px-10">
          <div className="flex w-full">
            {/* Home page main carousel */}
            <div className="flex-shrink-0 xl:pr-6 lg:block w-full lg:w-3/5">
              <Suspense fallback={<p>Loading carousel...</p>}>
                <MainCarousel />
              </Suspense>
            </div>
            {/* Coupon Offer Card */}
            <div className="w-full hidden lg:flex ">
              <Suspense fallback={<p>Loading coupons...</p>}>
                <OfferCard attributes={attributes} />
              </Suspense>
            </div>
          </div>

          {/* Banner */}
          <div className="bg-primary/10 dark:bg-primary/5 px-10 py-6 rounded-xl mt-6 border border-primary/10">
            <Banner storeCustomizationSetting={storeCustomizationSetting} />
          </div>
        </div>
      </div>

      {/* feature category's */}
      {storeCustomizationSetting?.home?.featured_status && (
        <div className="bg-muted/50 dark:bg-muted/30 lg:py-16 py-10 border-y border-border/50">
          <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
            <div className="mb-10 flex justify-center">
              <div className="text-center w-full lg:w-2/5">
                <h2 className="text-xl lg:text-2xl mb-2 font-semibold text-foreground">
                  <CMSkeletonTwo
                    count={1}
                    height={30}
                    loading={false}
                    error={storeCustomizationError}
                    data={storeCustomizationSetting?.home?.feature_title}
                  />
                </h2>
                <p className="text-base text-muted-foreground leading-6">
                  <CMSkeletonTwo
                    count={4}
                    height={10}
                    loading={false}
                    error={storeCustomizationError}
                    data={storeCustomizationSetting?.home?.feature_description}
                  />
                </p>
              </div>
            </div>

            <Suspense fallback={<p>Loading feature category...</p>}>
              <FeatureCategory />
            </Suspense>
          </div>
        </div>
      )}

      {/* popular products */}
      {storeCustomizationSetting?.home?.popular_products_status && (
        <div className="bg-background lg:py-16 py-10">
          <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
            <div className="mb-10 flex justify-center">
              <div className="text-center w-full lg:w-2/5">
                <h2 className="text-xl lg:text-2xl mb-2 font-semibold text-foreground">
                  <CMSkeletonTwo
                    count={1}
                    height={30}
                    loading={false}
                    error={storeCustomizationError}
                    data={storeCustomizationSetting?.home?.popular_title}
                  />
                </h2>
                <p className="text-base font-sans text-muted-foreground leading-6">
                  <CMSkeletonTwo
                    count={5}
                    height={10}
                    loading={false}
                    error={storeCustomizationError}
                    data={storeCustomizationSetting?.home?.popular_description}
                  />
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-3">
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
          </div>
        </div>
      )}

      {/* Best Sellers — Takealot-style horizontal row */}
      <Suspense fallback={null}>
        <BestSellersRow attributes={attributes} />
      </Suspense>

      {/* Flash Sale — red spotlight section (real on-sale products; the
          Laravel API has no campaign module to back a "real" campaign). */}
      <Suspense fallback={null}>
        <FlashSaleRow attributes={attributes} />
      </Suspense>

      {/* New Arrivals — Takealot-style horizontal row */}
      <Suspense fallback={null}>
        <NewArrivalsRow attributes={attributes} />
      </Suspense>

      {/* Category-wise Product Sliders (admin controlled) */}
      <Suspense fallback={null}>
        <CategoryProductSliders attributes={attributes} />
      </Suspense>

      {/* Category spotlight rows */}
      <Suspense fallback={null}>
        <CategoryDealsRow
          title="Top Deals in Liquor"
          categorySlug="liquor"
          attributes={attributes}
          tint
        />
      </Suspense>
      <Suspense fallback={null}>
        <CategoryDealsRow
          title="Top Deals in Gaming"
          categorySlug="gaming"
          attributes={attributes}
        />
      </Suspense>

      {/* promotional banner card */}
      {storeCustomizationSetting?.home?.delivery_status && (
        <div className="block mx-auto max-w-screen-2xl">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
            <div className="lg:p-16 p-6 bg-primary shadow-sm border border-primary/20 text-primary-foreground rounded-2xl">
              <CardTwo />
            </div>
          </div>
        </div>
      )}

      {/* discounted products */}
      {storeCustomizationSetting?.home?.discount_product_status &&
        discountedProducts?.length > 0 && (
          <div
            id="discount"
            className="bg-muted/50 dark:bg-muted/30 lg:py-16 py-10 border-t border-border/50"
          >
            <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
              <div className="mb-10 flex justify-center">
                <div className="text-center w-full lg:w-2/5">
                  <h2 className="text-xl lg:text-2xl mb-2 font-semibold text-foreground">
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
                  <p className="text-base font-sans text-muted-foreground leading-6">
                    <CMSkeletonTwo
                      count={5}
                      height={20}
                      loading={false}
                      error={storeCustomizationError}
                      data={
                        storeCustomizationSetting?.home
                          ?.latest_discount_description
                      }
                    />
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-3">
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
            </div>
          </div>
        )}
    </div>
  );
};

export default HomeDefault;
