import { Suspense } from "react";
import Link from "next/link";
import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import StickyCart from "@components/cart/StickyCart";
import ProductCard from "@components/product/ProductCard";
import MainCarousel from "@components/carousel/MainCarousel";
import CMSkeletonTwo from "@components/preloader/CMSkeleton";
import DiscountedCard from "@components/product/DiscountedCard";
import CampaignSection from "@components/campaign/CampaignSection";
import CategoryProductSliders from "@components/home/CategoryProductSliders";

const HomeElectronic = ({
  popularProducts,
  discountedProducts,
  attributes,
  storeCustomizationSetting,
  storeCustomizationError,
  globalSetting,
  categories,
  featuredCampaign,
}) => {
  const topCategories = categories?.[0]?.children?.slice(0, 8) || [];

  return (
    <div className="min-h-screen bg-background">
      <StickyCart />

      {/* Hero — Split Layout */}
      <div className="relative w-full bg-foreground overflow-hidden">
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-12 lg:py-20">
            {/* Left: Text */}
            <div className="text-primary-foreground relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/15 border border-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                New Season Tech
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-5 leading-[1.1]">
                {globalSetting?.shop_name || "Latest Tech"}{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Deals
                </span>
              </h1>
              <p className="text-primary-foreground/60 text-base lg:text-lg mb-8 max-w-md leading-relaxed">
                {globalSetting?.site_description ||
                  "Discover cutting-edge electronics, gadgets, and accessories at unbeatable prices."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/search"
                  className="inline-flex items-center px-7 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/25"
                >
                  Shop Now
                </Link>
                <Link
                  href="/offers"
                  className="inline-flex items-center px-7 py-3.5 border border-primary-foreground/30 text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
                >
                  Today&apos;s Deals
                </Link>
              </div>
            </div>
            {/* Right: Carousel */}
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
              <Suspense
                fallback={
                  <div className="h-[380px] bg-slate-800 animate-pulse rounded-2xl" />
                }
              >
                <MainCarousel />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation Strip */}
      {storeCustomizationSetting?.home?.featured_status && (
        <section className="bg-background border-b border-border py-8 lg:py-10">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Shop by Category
              </h2>
              <Link
                href="/search"
                className="text-xs font-medium text-primary hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3 lg:gap-4">
              {topCategories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/search?_id=${cat._id}`}
                  className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-transparent hover:border-border hover:bg-muted/50 transition-all duration-200"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-200">
                    {cat.icon ? (
                      <img
                        src={cat.icon}
                        alt=""
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <span className="text-xl">📱</span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-center text-muted-foreground group-hover:text-foreground line-clamp-2 transition-colors">
                    {cat.name?.en || "Category"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Campaign / Flash Sale Section */}
      {storeCustomizationSetting?.home?.campaign_home_status !== false &&
        (featuredCampaign ? (
          <CampaignSection campaign={featuredCampaign} attributes={attributes} />
        ) : (
          /* Static Flash Deals Banner fallback */
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
            <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
              <div className="flex items-center justify-between py-3 text-white">
                <div className="flex items-center gap-3">
                  <span className="text-lg">⚡</span>
                  <span className="text-sm font-bold uppercase tracking-wider">
                    Flash Deals
                  </span>
                  <span className="hidden sm:inline text-sm opacity-80">
                    — Limited time offers on top electronics
                  </span>
                </div>
                <Link
                  href="/offers"
                  className="text-xs font-semibold bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full hover:bg-white/30 transition-colors"
                >
                  View All
                </Link>
              </div>
            </div>
          </div>
        ))}

      {/* Category-wise Product Sliders (admin controlled) */}
      <Suspense fallback={null}>
        <CategoryProductSliders attributes={attributes} />
      </Suspense>

      {/* Popular Products */}
      {storeCustomizationSetting?.home?.popular_products_status && (
        <section className="bg-background py-14 lg:py-20">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full" />
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold">
                    <CMSkeletonTwo
                      count={1}
                      height={28}
                      loading={false}
                      error={storeCustomizationError}
                      data={storeCustomizationSetting?.home?.popular_title}
                    />
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <CMSkeletonTwo
                      count={1}
                      height={12}
                      loading={false}
                      error={storeCustomizationError}
                      data={
                        storeCustomizationSetting?.home?.popular_description
                      }
                    />
                  </p>
                </div>
              </div>
              <Link
                href="/search"
                className="text-sm font-medium text-primary bg-primary/5 px-4 py-2 rounded-xl hover:bg-primary/10 transition-colors"
              >
                See More →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
              {popularProducts
                ?.slice(
                  0,
                  Number(storeCustomizationSetting?.home?.popular_product_limit) || 12,
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
        </section>
      )}

      {/* Feature Highlights */}
      {storeCustomizationSetting?.home?.delivery_status && (
        <section className="bg-foreground py-14 lg:py-16">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {[
                {
                  Icon: Truck,
                  title: "Free Express Shipping",
                  desc: "On orders over $50",
                },
                {
                  Icon: ShieldCheck,
                  title: "Secure Payment",
                  desc: "256-bit SSL encryption",
                },
                {
                  Icon: RotateCcw,
                  title: "Easy Returns",
                  desc: "30-day return policy",
                },
                {
                  Icon: Headphones,
                  title: "24/7 Support",
                  desc: "Expert tech assistance",
                },
              ].map((item, i) => {
                const IconComp = item.Icon;
                return (
                  <div
                    key={i}
                    className="group text-center p-6 lg:p-8 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300"
                  >
                    <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComp
                        className="w-7 h-7 text-primary"
                        strokeWidth={1.5}
                      />
                    </div>
                    <h3 className="font-semibold text-primary-foreground mb-1 text-sm">
                      {item.title}
                    </h3>
                    <p className="text-xs text-primary-foreground/50">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Discounted Products */}
      {storeCustomizationSetting?.home?.discount_product_status &&
        discountedProducts?.length > 0 && (
          <section id="discount" className="bg-muted/50 py-14 lg:py-20">
            <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold">
                      <CMSkeletonTwo
                        count={1}
                        height={28}
                        loading={false}
                        error={storeCustomizationError}
                        data={
                          storeCustomizationSetting?.home?.latest_discount_title
                        }
                      />
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <CMSkeletonTwo
                        count={1}
                        height={12}
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
                <Link
                  href="/search"
                  className="text-sm font-medium text-red-500 bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                >
                  All Deals →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
                {discountedProducts
                  ?.slice(
                    0,
                    Number(storeCustomizationSetting?.home?.latest_discount_product_limit) || 12,
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
          </section>
        )}
    </div>
  );
};

export default HomeElectronic;
