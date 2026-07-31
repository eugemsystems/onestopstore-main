import { Suspense } from "react";
import Link from "next/link";
import StickyCart from "@components/cart/StickyCart";
import ProductCard from "@components/product/ProductCard";
import CMSkeletonTwo from "@components/preloader/CMSkeleton";
import DiscountedCard from "@components/product/DiscountedCard";
import CampaignSection from "@components/campaign/CampaignSection";
import CategoryProductSliders from "@components/home/CategoryProductSliders";
import AuthAwareLink from "@components/common/AuthAwareLink";

const HomeClothing = ({
  popularProducts,
  discountedProducts,
  attributes,
  storeCustomizationSetting,
  storeCustomizationError,
  globalSetting,
  categories,
  featuredCampaign,
}) => {
  const topCategories = categories?.[0]?.children?.slice(0, 6) || [];
  const slider = storeCustomizationSetting?.slider;
  const home = storeCustomizationSetting?.home;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <StickyCart />

      {/* ═══ Fashion Hero — Split Layout ═══ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-screen-2xl">
          <div className="grid lg:grid-cols-2 min-h-[480px] lg:min-h-[560px]">
            {/* Left — Text */}
            <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-12 lg:py-20 order-2 lg:order-1 bg-neutral-50 dark:bg-neutral-900">
              <div className="max-w-lg">
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-500 mb-4 border border-neutral-200 dark:border-neutral-700 px-3 py-1 rounded-full">
                  New Season
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white leading-[1.1] tracking-tight mb-5">
                  {slider?.first_title?.en || "Elevate Your Wardrobe"}
                </h1>
                <p className="text-base text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8 max-w-md">
                  {slider?.first_description?.en ||
                    "Discover our curated collection of contemporary essentials designed for the modern lifestyle."}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={slider?.first_link || "/search"}
                    className="inline-flex items-center px-8 py-3.5 bg-primary text-primary-foreground text-sm font-semibold tracking-wide uppercase rounded-none hover:opacity-90 transition-colors"
                  >
                    {slider?.first_button?.en || "Shop Collection"}
                  </Link>
                  <Link
                    href={slider?.second_link || "/search"}
                    className="inline-flex items-center px-8 py-3.5 border-2 border-primary text-primary text-sm font-semibold tracking-wide uppercase rounded-none hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {slider?.second_button?.en || "View All"}
                  </Link>
                </div>
              </div>
            </div>
            {/* Right — Image */}
            <div className="relative order-1 lg:order-2 min-h-[300px] lg:min-h-full bg-neutral-200 dark:bg-neutral-800">
              <img
                src={slider?.first_img || "/slider/slider-1.jpg"}
                alt="Fashion Hero"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Overlay gradient on mobile */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral-50/80 dark:to-neutral-900/80 lg:hidden" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Marquee Trust Bar ═══ */}
      <div className="bg-neutral-900 dark:bg-neutral-800 text-white overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-3">
          {Array(3)
            .fill(null)
            .map((_, ri) => (
              <div
                key={ri}
                className="flex items-center gap-12 mx-6 text-[11px] font-medium uppercase tracking-[0.2em]"
              >
                <span className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  Free shipping over $75
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  Easy 30-day returns
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  New arrivals weekly
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  Sustainable materials
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* ═══ Featured Categories — Magazine Grid ═══ */}
      {storeCustomizationSetting?.home?.featured_status && (
        <section className="py-16 lg:py-24 bg-white dark:bg-neutral-950">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
            <div className="text-center mb-14">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-3">
                Shop by Category
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                <CMSkeletonTwo
                  count={1}
                  height={40}
                  loading={false}
                  error={storeCustomizationError}
                  data={storeCustomizationSetting?.home?.feature_title}
                />
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 mt-3 max-w-md mx-auto text-sm">
                <CMSkeletonTwo
                  count={1}
                  height={14}
                  loading={false}
                  error={storeCustomizationError}
                  data={storeCustomizationSetting?.home?.feature_description}
                />
              </p>
            </div>

            {/* Asymmetric category grid */}
            <div className="grid grid-cols-2 md:grid-cols-12 gap-3 lg:gap-4">
              {topCategories.map((cat, index) => {
                const spans = [
                  "md:col-span-4",
                  "md:col-span-4",
                  "md:col-span-4",
                  "md:col-span-6",
                  "md:col-span-3",
                  "md:col-span-3",
                ];
                const heights = [
                  "h-72 md:h-96",
                  "h-72 md:h-96",
                  "h-72 md:h-96",
                  "h-64 md:h-80",
                  "h-64 md:h-80",
                  "h-64 md:h-80",
                ];
                return (
                  <Link
                    key={cat._id}
                    href={`/search?_id=${cat._id}`}
                    className={`group relative overflow-hidden ${spans[index] || "md:col-span-4"} ${heights[index] || "h-72 md:h-80"}`}
                  >
                    {cat.icon ? (
                      <img
                        src={cat.icon}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800" />
                    )}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-500" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/60 mb-2">
                        {cat.children?.length || 0} styles
                      </p>
                      <h3 className="text-white font-bold text-lg lg:text-2xl tracking-wide uppercase">
                        {cat.name?.en || "Category"}
                      </h3>
                      <span className="mt-3 text-white/70 text-xs font-medium uppercase tracking-wider group-hover:text-white transition-colors border-b border-white/30 group-hover:border-white pb-0.5">
                        Shop now
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Editorial Split Banner ═══ */}
      {storeCustomizationSetting?.home?.delivery_status && (
        <section className="bg-neutral-50 dark:bg-neutral-900">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-10 py-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Card 1 */}
              <div className="relative overflow-hidden bg-gradient-to-br from-neutral-100 to-stone-100 dark:from-neutral-800 dark:to-stone-900 p-10 lg:p-14 flex flex-col justify-center min-h-[280px]">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-3">
                  {home?.quick_delivery_subtitle?.en || "The Seasonal Edit"}
                </p>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3 leading-tight">
                  {home?.quick_delivery_title?.en ||
                    "Curated Styles For Every Occasion"}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm leading-relaxed">
                  {home?.quick_delivery_description?.en ||
                    "Handpicked pieces that blend comfort with contemporary style."}
                </p>
                <div className="flex gap-3">
                  <AuthAwareLink
                    href={home?.quick_delivery_link || "/search"}
                    className="inline-flex items-center px-6 py-2.5 bg-primary text-primary-foreground text-xs font-semibold tracking-wider uppercase hover:opacity-90 transition-colors"
                  >
                    {home?.quick_delivery_button?.en || "Shop Now"}
                  </AuthAwareLink>
                  <AuthAwareLink
                    href={home?.promotion_button_link || "/offers"}
                    className="inline-flex items-center px-6 py-2.5 border border-primary text-primary text-xs font-semibold tracking-wider uppercase hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {home?.promotion_button_name?.en || "View Lookbook"}
                  </AuthAwareLink>
                </div>
                {/* Decorative */}
                <div className="absolute -right-8 -bottom-8 w-40 h-40 border border-neutral-200 dark:border-neutral-700 rounded-full opacity-50" />
                <div className="absolute -right-4 -bottom-4 w-24 h-24 border border-neutral-200 dark:border-neutral-700 rounded-full opacity-30" />
              </div>
              {/* Card 2 — Stats */}
              <div className="bg-neutral-900 dark:bg-neutral-800 text-white p-10 lg:p-14 flex items-center min-h-[280px]">
                <div className="grid grid-cols-3 gap-6 w-full text-center">
                  <div>
                    <p className="text-4xl lg:text-5xl font-bold tracking-tight">
                      50+
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mt-2">
                      Brands
                    </p>
                  </div>
                  <div className="border-x border-neutral-700">
                    <p className="text-4xl lg:text-5xl font-bold tracking-tight">
                      2k+
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mt-2">
                      Products
                    </p>
                  </div>
                  <div>
                    <p className="text-4xl lg:text-5xl font-bold tracking-tight">
                      24h
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mt-2">
                      Delivery
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ Popular Products ═══ */}
      {storeCustomizationSetting?.home?.popular_products_status && (
        <section className="py-16 lg:py-24 bg-white dark:bg-neutral-950">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-2">
                  Just Dropped
                </p>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  <CMSkeletonTwo
                    count={1}
                    height={32}
                    loading={false}
                    error={storeCustomizationError}
                    data={storeCustomizationSetting?.home?.popular_title}
                  />
                </h2>
              </div>
              <Link
                href="/search"
                className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline-offset-4 hover:underline hidden sm:block transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-5">
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
        </section>
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

      {/* ═══ Discounted Products ═══ */}
      {storeCustomizationSetting?.home?.discount_product_status &&
        discountedProducts?.length > 0 && (
          <section
            id="discount"
            className="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-900/50"
          >
            <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500 mb-2">
                    On Sale
                  </p>
                  <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    <CMSkeletonTwo
                      count={1}
                      height={32}
                      loading={false}
                      error={storeCustomizationError}
                      data={
                        storeCustomizationSetting?.home?.latest_discount_title
                      }
                    />
                  </h2>
                </div>
                <Link
                  href="/search"
                  className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline-offset-4 hover:underline hidden sm:block transition-colors"
                >
                  Shop All Sale →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-5">
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
          </section>
        )}

      {/* ═══ Trust Badges ═══ */}
      <section className="bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 py-14">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                icon: "🚚",
                title: "Free Shipping",
                desc: "On orders over $75",
              },
              {
                icon: "↩️",
                title: "Easy Returns",
                desc: "30-day return policy",
              },
              {
                icon: "🔒",
                title: "Secure Payment",
                desc: "SSL encrypted checkout",
              },
              {
                icon: "💬",
                title: "24/7 Support",
                desc: "Always here to help",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Newsletter ═══ */}
      <section className="bg-neutral-900 dark:bg-neutral-800 text-white py-16 lg:py-20">
        <div className="mx-auto max-w-screen-md px-4 sm:px-10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 mb-4">
            Join the Community
          </p>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-3">
            Stay in Style
          </h2>
          <p className="text-neutral-400 mb-8 text-sm max-w-sm mx-auto">
            Subscribe for exclusive access to new arrivals, seasonal edits, and
            member-only offers.
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3.5 bg-transparent border border-neutral-600 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <button className="px-7 py-3.5 bg-primary text-primary-foreground text-sm font-semibold uppercase tracking-wider hover:opacity-90 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeClothing;
