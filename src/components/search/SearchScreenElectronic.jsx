"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import {
  IoGridOutline,
  IoListOutline,
  IoFilterOutline,
  IoCloseOutline,
  IoChevronDown,
  IoChevronForward,
  IoChevronBack,
  IoStarSharp,
} from "react-icons/io5";

import useSearchScreen from "@hooks/useSearchScreen";
import ProductCard from "@components/product/ProductCard";
import { Button } from "@components/ui/button";
import useUtilsFunction from "@hooks/useUtilsFunction";

const SearchScreenElectronic = ({
  products: initialProducts,
  attributes,
  categories,
  searchQuery,
  selectedCategory,
  initialSort = "",
  initialRating = "",
  minPrice = "",
  maxPrice = "",
  totalDoc: initialTotalDoc = 0,
  page: initialPage = 1,
  hasMore: initialHasMore = false,
  basePath = "/search",
}) => {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    departments: true,
    ratings: true,
  });
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const categoryScrollRef = useRef(null);

  const { showingTranslateValue } = useUtilsFunction();
  const {
    products,
    totalDoc,
    hasMore,
    loadingMore,
    loadMore,
    sortBy,
    minRating,
    handleCategoryClick,
    handleSortChange,
    handleRatingChange,
    clearFilters,
    pushSearch,
  } = useSearchScreen({
    initialProducts,
    totalDoc: initialTotalDoc,
    page: initialPage,
    hasMore: initialHasMore,
    searchQuery,
    selectedCategory,
    initialSort,
    initialRating,
    minPrice,
    maxPrice,
    basePath,
  });

  useEffect(() => setMounted(true), []);

  // Check if category bar can scroll
  const checkScroll = useCallback(() => {
    const el = categoryScrollRef.current;
    if (el) {
      const maxScroll = el.scrollWidth - el.clientWidth;
      setCanScrollRight(maxScroll > 0 && el.scrollLeft < maxScroll - 2);
      setCanScrollLeft(el.scrollLeft > 2);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkScroll, 100);
    const el = categoryScrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        clearTimeout(timer);
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
    return () => clearTimeout(timer);
  }, [checkScroll, mounted]);

  const scrollCategoriesLeft = () => {
    categoryScrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollCategoriesRight = () => {
    categoryScrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  const toggleSection = useCallback(
    (s) => setExpandedSections((p) => ({ ...p, [s]: !p[s] })),
    [],
  );

  const onCategoryClick = (id, name) =>
    handleCategoryClick(id, name, showingTranslateValue);

  if (!mounted) return null;

  const topCategories = categories?.[0]?.children || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/50 border-b border-border">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-10 py-4 lg:py-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : minRating === 5
                ? "5-Star Rated Products"
                : sortBy === "best-selling"
                  ? "Best-Selling Products"
                  : "Shop All Products"}
          </h1>
          <nav className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">
              {basePath === "/shop" ? "Shop" : "Search"}
            </span>
          </nav>
        </div>
      </div>

      {/* ═══ Sticky Category Pills ═══ */}
      {topCategories.length > 0 && (
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
            <div className="relative flex items-center gap-1">
              {/* Left Arrow */}
              <button
                onClick={scrollCategoriesLeft}
                disabled={!canScrollLeft}
                className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 ${canScrollLeft
                  ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:scale-105 border-primary cursor-pointer"
                  : "bg-muted/50 text-muted-foreground/40 border-border/40 cursor-default"
                  }`}
                aria-label="Scroll categories left"
              >
                <IoChevronBack className="h-4 w-4" />
              </button>

              {/* Scrollable categories */}
              <div className="relative flex-1 overflow-hidden">
                {canScrollLeft && (
                  <div className="absolute left-0 top-0 bottom-0 w-6 bg-linear-to-r from-background/95 to-transparent z-10 pointer-events-none" />
                )}
                <div
                  ref={categoryScrollRef}
                  className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar"
                >
                  <button
                    onClick={() => pushSearch({ _id: null, category: null })}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${!selectedCategory ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "bg-primary/5 dark:bg-primary/10 text-primary hover:bg-primary/10 dark:hover:bg-primary/20 border border-primary/20"}`}
                  >
                    All
                  </button>
                  {topCategories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => onCategoryClick(cat._id, cat.name)}
                      className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${selectedCategory === cat._id ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "bg-primary/5 dark:bg-primary/10 text-primary hover:bg-primary/10 dark:hover:bg-primary/20 border border-primary/20"}`}
                    >
                      {showingTranslateValue(cat.name)}
                    </button>
                  ))}
                </div>
                {canScrollRight && (
                  <div className="absolute right-0 top-0 bottom-0 w-6 bg-linear-to-l from-background/95 to-transparent z-10 pointer-events-none" />
                )}
              </div>

              {/* Right Arrow */}
              <button
                onClick={scrollCategoriesRight}
                disabled={!canScrollRight}
                className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 ${canScrollRight
                  ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:scale-105 border-primary cursor-pointer"
                  : "bg-muted/50 text-muted-foreground/40 border-border/40 cursor-default"
                  }`}
                aria-label="Scroll categories right"
              >
                <IoChevronForward className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-screen-2xl px-4 pt-4 pb-8 sm:px-10">
        <div className="flex gap-8 lg:gap-10">
          {/* Overlay */}
          {showFilters && (
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setShowFilters(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-80 bg-background shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto lg:sticky lg:top-46 lg:self-start lg:inset-auto lg:z-auto lg:w-60 lg:shrink-0 lg:transform-none lg:shadow-none lg:overflow-visible ${showFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
          >
            <div className="p-6 lg:p-0">
              <div className="flex items-center justify-between mb-6 lg:mb-0">
                <h3 className="text-xs font-bold uppercase tracking-wider lg:hidden">
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-1"
                >
                  <IoCloseOutline className="h-5 w-5" />
                </button>
              </div>

              {/* Departments */}
              <div>
                <button
                  onClick={() => toggleSection("departments")}
                  className="w-full flex items-center justify-between py-3 text-base font-semibold text-slate-800 dark:text-slate-200"
                >
                  Categories
                  <IoChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${expandedSections.departments ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${expandedSections.departments ? "max-h-125 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="space-y-0.5 pb-4">
                    {topCategories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => onCategoryClick(cat._id, cat.name)}
                        className={`flex items-center justify-between w-full py-1 text-sm rounded-lg transition-all ${selectedCategory === cat._id ? "text-cyan-600 dark:text-cyan-400 font-medium bg-cyan-50 dark:bg-cyan-500/10" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <span>{showingTranslateValue(cat.name)}</span>
                        {cat.children?.length > 0 && (
                          <span className="text-[10px] text-muted-foreground/60">
                            {cat.children.length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <hr className="border-border my-2" />

              {/* Ratings */}
              <div>
                <button
                  onClick={() => toggleSection("ratings")}
                  className="w-full flex items-center justify-between py-3 text-base font-semibold text-slate-800 dark:text-slate-200"
                >
                  Rating
                  <IoChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${expandedSections.ratings ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${expandedSections.ratings ? "max-h-75 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="space-y-1.5 pb-4">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <button
                        key={star}
                        onClick={() =>
                          handleRatingChange(minRating === star ? null : star)
                        }
                        className={`flex items-center gap-2 w-full py-1 text-sm rounded-lg transition-all ${minRating === star ? "text-cyan-600 dark:text-cyan-400 font-medium bg-cyan-50 dark:bg-cyan-500/10" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <span className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <IoStarSharp
                              key={i}
                              className={`h-3.5 w-3.5 ${i < star ? "text-amber-400" : "text-muted-foreground/30"}`}
                            />
                          ))}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <hr className="border-border my-2" />
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs rounded-xl mt-4"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(true)}
                  className="flex items-center gap-2 text-sm font-medium lg:hidden"
                >
                  <IoFilterOutline className="h-4 w-4" />
                  Filters
                </button>
                <div className="hidden sm:flex items-center gap-0.5 border border-border rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-cyan-500 text-white" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <IoGridOutline className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-cyan-500 text-white" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <IoListOutline className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-xs border border-border rounded-xl px-3 py-2 bg-background focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="default">Featured</option>
                <option value="best-selling">Best Selling</option>
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {products?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Image
                  src="/no-result.svg"
                  alt="No results"
                  width={250}
                  height={230}
                  className="mb-6 opacity-80"
                />
                <h2 className="text-xl font-semibold mb-1">
                  No products found
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Try a different search term or browse departments
                </p>
                <Button
                  className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white"
                  onClick={clearFilters}
                >
                  Browse All
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-3 lg:gap-5 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"}`}
                >
                  {products?.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      attributes={attributes}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-12 text-center">
                    <Button
                      onClick={loadMore}
                      disabled={loadingMore}
                      variant="outline"
                      className="min-w-50 rounded-xl border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10"
                    >
                      {loadingMore ? "Loading..." : "Load More Products"}
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Showing {products.length} of {totalDoc}
                    </p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(SearchScreenElectronic), {
  ssr: false,
});
