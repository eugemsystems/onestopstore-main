"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDownIcon,
  // Grocery / Default icons
  Apple,
  Milk,
  Carrot,
  ShoppingBasket,
  // Electronic icons
  Monitor,
  Smartphone,
  Cpu,
  // Clothing icons
  Shirt,
  // Modern icons
  Sparkles,
  Package,
  Grid3X3,
} from "lucide-react";
import useUtilsFunction from "@hooks/useUtilsFunction";

// Layout-specific configuration
const layoutConfig = {
  default: {
    triggerLabel: "Categories",
    fallbackIcon: ShoppingBasket,
    subFallbackIcon: Package,
    emptyStateIcon: "🛒",
    emptyStateTitle: "Browse Categories",
    emptyStateDesc:
      "Hover over a category to browse products and find the best deals",
    bannerLabel: "🔥 Today's Deals",
    bannerText: "Save big on",
    bannerLink: "/offers",
    bannerCta: "Shop Deals",
    accentFrom: "from-emerald-50",
    accentTo: "to-teal-50",
    darkAccentFrom: "dark:from-emerald-950/20",
    darkAccentTo: "dark:to-teal-950/20",
    bannerTextColor: "text-emerald-600 dark:text-emerald-400",
  },
  grocery: {
    triggerLabel: "Categories",
    fallbackIcon: Apple,
    subFallbackIcon: Carrot,
    emptyStateIcon: "🥬",
    emptyStateTitle: "Fresh Categories",
    emptyStateDesc:
      "Hover over a category to browse fresh products and groceries",
    bannerLabel: "🥦 Fresh Picks",
    bannerText: "Fresh deals on",
    bannerLink: "/offers",
    bannerCta: "Shop Fresh",
    accentFrom: "from-green-50",
    accentTo: "to-emerald-50",
    darkAccentFrom: "dark:from-green-950/20",
    darkAccentTo: "dark:to-emerald-950/20",
    bannerTextColor: "text-green-600 dark:text-green-400",
  },
  clothing: {
    triggerLabel: "Shop by Category",
    fallbackIcon: Shirt,
    subFallbackIcon: Shirt,
    emptyStateIcon: "👗",
    emptyStateTitle: "Explore Our Collections",
    emptyStateDesc:
      "Hover over a category to discover subcategories and trending items",
    bannerLabel: "✨ Trending Now",
    bannerText: "Explore the latest arrivals in",
    bannerLink: "/offers",
    bannerCta: "Shop Now",
    accentFrom: "from-pink-50",
    accentTo: "to-purple-50",
    darkAccentFrom: "dark:from-pink-950/20",
    darkAccentTo: "dark:to-purple-950/20",
    bannerTextColor: "text-pink-600 dark:text-pink-400",
  },
  electronic: {
    triggerLabel: "Categories",
    fallbackIcon: Cpu,
    subFallbackIcon: Smartphone,
    emptyStateIcon: null,
    emptyStateTitle: "Explore Electronics",
    emptyStateDesc:
      "Hover over a department to browse products and find the best tech deals",
    bannerLabel: "⚡ Tech Deals",
    bannerText: "Save big on",
    bannerLink: "/offers",
    bannerCta: "Shop Deals",
    accentFrom: "from-blue-50",
    accentTo: "to-indigo-50",
    darkAccentFrom: "dark:from-blue-950/20",
    darkAccentTo: "dark:to-indigo-950/20",
    bannerTextColor: "text-blue-600 dark:text-blue-400",
  },
  modern: {
    triggerLabel: "Categories",
    fallbackIcon: Sparkles,
    subFallbackIcon: Grid3X3,
    emptyStateIcon: "✨",
    emptyStateTitle: "Discover Products",
    emptyStateDesc:
      "Hover over a category to explore curated products and exclusive deals",
    bannerLabel: "🎯 Featured",
    bannerText: "Discover the best in",
    bannerLink: "/offers",
    bannerCta: "Explore",
    accentFrom: "from-violet-50",
    accentTo: "to-fuchsia-50",
    darkAccentFrom: "dark:from-violet-950/20",
    darkAccentTo: "dark:to-fuchsia-950/20",
    bannerTextColor: "text-violet-600 dark:text-violet-400",
  },
};

const MegaMenuCategory = ({
  categories,
  categoryError,
  storeLayout = "default",
}) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const { showingTranslateValue } = useUtilsFunction();

  const topCategories = categories?.[0]?.children || [];
  const config = layoutConfig[storeLayout] || layoutConfig["default"];

  const FallbackIcon = config.fallbackIcon;
  const SubFallbackIcon = config.subFallbackIcon;

  // Electronic layout uses pill-style trigger
  const isElectronic = storeLayout === "electronic" || storeLayout === "modern";

  return (
    <div className="relative group">
      {/* Trigger Button */}
      <button
        className={
          isElectronic
            ? "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-primary-foreground/25 text-sm font-semibold text-primary-foreground transition-colors focus:outline-none"
            : "inline-flex items-center py-2 text-sm font-medium text-foreground hover:text-primary focus:outline-none transition-colors"
        }
      >
        <span>{config.triggerLabel}</span>
        <ChevronDownIcon className="ml-1 h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-200" />
      </button>

      {/* Mega Menu Dropdown */}
      <div
        suppressHydrationWarning
        className={`shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-0 top-full z-50 w-225 transition-all duration-200 ease-in-out ${
          isElectronic ? "mt-3" : "mt-1"
        }`}
      >
        {isElectronic && (
          <div className="absolute -top-2 left-6 h-4 w-4 rotate-45 bg-white dark:bg-neutral-900 border-l border-t border-gray-100 dark:border-neutral-700"></div>
        )}
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="flex h-[70vh] bg-background text-sm">
            {/* Left: Category Sidebar */}
            <div
              suppressHydrationWarning
              className={
                "w-64 shrink-0 border-r border-border overflow-y-auto bg-muted/50 py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300"
              }
            >
              {categoryError ? (
                <p className="flex justify-center items-center m-auto p-4 text-sm text-red-500">
                  {categoryError}
                </p>
              ) : (
                <div className="space-y-0.5">
                  {topCategories.map((category) => (
                    <button
                      key={category._id}
                      onMouseEnter={() => setActiveCategory(category)}
                      className={`w-full flex items-center gap-2 px-3 py-3 text-sm text-left transition-all ${
                        activeCategory?._id === category._id
                          ? "bg-background text-primary font-medium border-l-4 border-primary"
                          : "text-foreground hover:bg-background/80 font-medium hover:text-primary border-l-4 border-transparent"
                      }`}
                    >
                      {category.icon ? (
                        <Image
                          src={category.icon}
                          alt={showingTranslateValue(category.name)}
                          width={22}
                          height={22}
                          className="rounded"
                        />
                      ) : (
                        <div className="w-5.5 h-5.5 rounded bg-primary/10 flex items-center justify-center">
                          <FallbackIcon className="h-3 w-3 text-primary" />
                        </div>
                      )}
                      <span className="truncate">
                        {showingTranslateValue(category.name)}
                      </span>
                      {category.children?.length > 0 && (
                        <ChevronDownIcon className="ml-auto h-3 w-3 -rotate-90 text-muted-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Content Area */}
            <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
              {activeCategory ? (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {showingTranslateValue(activeCategory.name)}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activeCategory.children?.length || 0} subcategories
                        available
                      </p>
                    </div>
                    <Link
                      href={`/search?category=${activeCategory.slug}&_id=${activeCategory._id}`}
                      className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                    >
                      View All →
                    </Link>
                  </div>

                  {activeCategory.children?.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {activeCategory.children.map((sub) => (
                        <Link
                          key={sub._id}
                          href={`/search?category=${sub.slug}&_id=${sub._id}`}
                          className="group/item flex items-center gap-3 rounded-lg border border-transparent p-3 hover:border-border hover:bg-muted/50 transition-all"
                        >
                          {sub.icon ? (
                            <Image
                              src={sub.icon}
                              alt={showingTranslateValue(sub.name)}
                              width={36}
                              height={36}
                              className="rounded-lg"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                              <SubFallbackIcon className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground group-hover/item:text-primary truncate">
                              {showingTranslateValue(sub.name)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      <p className="text-sm">
                        Browse all {showingTranslateValue(activeCategory.name)}{" "}
                        products
                      </p>
                    </div>
                  )}

                  {/* Layout-themed Banner */}
                  <div
                    className={`mt-5 rounded-lg bg-linear-to-r ${config.accentFrom} ${config.accentTo} ${config.darkAccentFrom} ${config.darkAccentTo} p-4 flex items-center justify-between`}
                  >
                    <div>
                      <p
                        className={`text-xs font-bold uppercase tracking-wider ${config.bannerTextColor}`}
                      >
                        {config.bannerLabel}
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {config.bannerText}{" "}
                        {showingTranslateValue(activeCategory.name)}
                      </p>
                    </div>
                    <Link
                      href={config.bannerLink}
                      className="text-xs font-semibold text-primary-foreground bg-primary px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      {config.bannerCta}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  {config.emptyStateIcon ? (
                    <div className="text-4xl mb-3">{config.emptyStateIcon}</div>
                  ) : (
                    <div className="flex gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Monitor className="h-5 w-5 text-primary" />
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-primary" />
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Cpu className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {config.emptyStateTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {config.emptyStateDesc}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenuCategory;
