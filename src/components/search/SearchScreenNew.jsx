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
  IoSearchOutline,
} from "react-icons/io5";

import useSearchScreen from "@hooks/useSearchScreen";
import ProductCard from "@components/product/ProductCard";
import { Button } from "@components/ui/button";
import useUtilsFunction from "@hooks/useUtilsFunction";

const SearchScreenNew = ({
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
  const [priceRange, setPriceRange] = useState({
    min: minPrice || 0,
    max: maxPrice || 1000,
  });
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: false,
  });
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const categoryScrollRef = useRef(null);
  const [categoryPath, setCategoryPath] = useState([]);

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
    // Delay to ensure DOM is rendered
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

  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const onCategoryClick = (categoryId, categorySlug) =>
    handleCategoryClick(categoryId, categorySlug);

  const handleDrillIn = (category) =>
    setCategoryPath((prev) => [...prev, category]);

  const handleBreadcrumbClick = (index) =>
    setCategoryPath((prev) => prev.slice(0, index + 1));

  const handleBreadcrumbReset = () => setCategoryPath([]);

  const applyPriceFilter = () => {
    pushSearch({
      minPrice: priceRange.min > 0 ? priceRange.min : null,
      maxPrice: priceRange.max < 1000 ? priceRange.max : null,
    });
  };

  if (!mounted) return null;

  const topCategories = categories?.[0]?.children || [];
  const currentCategory = categoryPath[categoryPath.length - 1] || null;
  const visibleCategories = currentCategory
    ? currentCategory.children || []
    : topCategories;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/50 border-b border-border">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-10 py-4 lg:py-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            {searchQuery ? (
              <>Results for &ldquo;{searchQuery}&rdquo;</>
            ) : minRating === 5 ? (
              "5-Star Rated Products"
            ) : sortBy === "best-selling" ? (
              "Best-Selling Products"
            ) : (
              "Shop All Products"
            )}
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
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-mds">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center gap-1">
              {/* Left Arrow */}
              <button
                onClick={scrollCategoriesLeft}
                disabled={!canScrollLeft}
                className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 ${
                  canScrollLeft
                    ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:scale-105 border-primary cursor-pointer"
                    : "bg-muted/50 text-muted-foreground/40 border-border/40 cursor-default"
                }`}
                aria-label="Scroll categories left"
              >
                <IoChevronBack className="h-4 w-4" />
              </button>

              {/* Scrollable categories */}
              <div className="relative flex-1 overflow-hidden">
                {/* Left fade */}
                {canScrollLeft && (
                  <div className="absolute left-0 top-0 bottom-0 w-6 bg-linear-to-r from-background/95 to-transparent z-10 pointer-events-none" />
                )}
                <div
                  ref={categoryScrollRef}
                  className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar"
                >
                  <button
                    onClick={() => pushSearch({ _id: null, category: null })}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                      !selectedCategory
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "bg-primary/5 dark:bg-primary/10 text-primary hover:bg-primary/10 dark:hover:bg-primary/20 border border-primary/20"
                    }`}
                  >
                    All
                  </button>
                  {topCategories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => onCategoryClick(cat._id, cat.slug)}
                      className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                        selectedCategory === cat._id
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                          : "bg-primary/5 dark:bg-primary/10 text-primary hover:bg-primary/10 dark:hover:bg-primary/20 border border-primary/20"
                      }`}
                    >
                      {cat.icon && (
                        <Image
                          src={cat.icon}
                          alt=""
                          width={14}
                          height={14}
                          className="rounded-sm object-contain"
                        />
                      )}
                      {showingTranslateValue(cat.name)}
                    </button>
                  ))}
                </div>
                {/* Right fade */}
                {canScrollRight && (
                  <div className="absolute right-0 top-0 bottom-0 w-6 bg-linear-to-l from-background/95 to-transparent z-10 pointer-events-none" />
                )}
              </div>

              {/* Right Arrow */}
              <button
                onClick={scrollCategoriesRight}
                disabled={!canScrollRight}
                className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 ${
                  canScrollRight
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
      <div className="relative z-10 -mt-4 sm:-mt-6 mx-auto max-w-screen-2xl px-4 py-6 lg:py-8 sm:px-6 lg:px-8">
        <div className="flex gap-6 lg:gap-8 min-h-[60vh]">
          {/* Mobile Filter Overlay */}
          {showFilters && (
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setShowFilters(false)}
            />
          )}

          {/* Filters Sidebar */}
          <aside
            className={`
              fixed inset-y-0 left-0 z-50 w-80 bg-card shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto
              lg:sticky lg:top-13 lg:self-start lg:inset-auto lg:z-auto lg:w-64 lg:shrink-0 lg:transform-none lg:shadow-none lg:bg-transparent lg:overflow-visible
              ${showFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
          >
            <div className="p-4 lg:p-0">
              <div className="bg-card rounded-none lg:rounded-2xl lg:p-5 p-4 border border-border h-screen lg:h-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Filters
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <IoCloseOutline className="h-5 w-5" />
                  </button>
                </div>

                {/* Categories — Collapsible */}
                <div className="mb-1">
                  <button
                    onClick={() => toggleSection("categories")}
                    className="w-full flex items-center justify-between py-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Categories
                    <IoChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expandedSections.categories ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSections.categories ? "max-h-100 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    {categoryPath.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pb-2 text-xs text-muted-foreground">
                        <button
                          onClick={handleBreadcrumbReset}
                          className="hover:text-primary transition-colors font-medium"
                        >
                          All Categories
                        </button>
                        {categoryPath.map((cat, index) => (
                          <React.Fragment key={cat._id}>
                            <IoChevronForward className="h-3 w-3 shrink-0" />
                            <button
                              onClick={() => handleBreadcrumbClick(index)}
                              className={`hover:text-primary transition-colors ${
                                index === categoryPath.length - 1
                                  ? "text-foreground font-medium"
                                  : ""
                              }`}
                            >
                              {showingTranslateValue(cat.name)}
                            </button>
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                    <div className="space-y-0.5 pb-4 max-h-60 overflow-y-auto">
                      {visibleCategories.map((cat) => {
                        const hasChildren = cat.children?.length > 0;
                        return (
                          <div
                            key={cat._id}
                            className={`flex items-center justify-between rounded-lg pr-1 text-sm transition-all duration-150 ${
                              selectedCategory === cat._id
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <button
                              onClick={() => onCategoryClick(cat._id, cat.slug)}
                              className="flex-1 text-left px-3 py-2"
                            >
                              {showingTranslateValue(cat.name)}
                            </button>
                            {hasChildren && (
                              <button
                                onClick={() => handleDrillIn(cat)}
                                aria-label={`View subcategories of ${showingTranslateValue(cat.name)}`}
                                className="shrink-0 p-1.5 rounded-md hover:bg-background/60 transition-colors"
                              >
                                <IoChevronForward className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <hr className="border-border" />

                {/* Price Range — Collapsible */}
                <div className="mb-1">
                  <button
                    onClick={() => toggleSection("price")}
                    className="w-full flex items-center justify-between py-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Price Range
                    <IoChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expandedSections.price ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSections.price ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <div className="flex items-center gap-3 pb-4">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            min: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      />
                      <span className="text-muted-foreground text-xs">to</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            max: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl mb-4"
                      onClick={applyPriceFilter}
                    >
                      Apply Price Filter
                    </Button>
                  </div>
                </div>

                <hr className="border-border" />

                {/* Rating — Collapsible */}
                <div className="mb-4">
                  <button
                    onClick={() => toggleSection("rating")}
                    className="w-full flex items-center justify-between py-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Rating
                    <IoChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expandedSections.rating ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSections.rating ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <div className="space-y-2.5 pb-4">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <label
                          key={rating}
                          className="flex cursor-pointer items-center gap-2.5 group"
                        >
                          <input
                            type="checkbox"
                            checked={minRating === rating}
                            onChange={() =>
                              handleRatingChange(
                                minRating === rating ? null : rating,
                              )
                            }
                            className="h-4 w-4 rounded border-border text-primary accent-primary"
                          />
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-3.5 w-3.5 ${i < rating ? "text-amber-400" : "text-muted-foreground/20"}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="ml-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                              & up
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear */}
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => {
                    setPriceRange({ min: 0, max: 1000 });
                    clearFilters();
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-3 border border-border">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(true)}
                  className="flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 lg:hidden transition-all"
                >
                  <IoFilterOutline className="h-4 w-4" />
                  Filters
                </button>

                <div className="hidden items-center gap-0.5 rounded-xl border border-border p-1 sm:flex">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`rounded-lg p-2 transition-all ${viewMode === "grid" ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  >
                    <IoGridOutline className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`rounded-lg p-2 transition-all ${viewMode === "list" ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  >
                    <IoListOutline className="h-4 w-4" />
                  </button>
                </div>

                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {totalDoc || 0} results
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                >
                  <option value="default">Featured</option>
                  <option value="best-selling">Best Selling</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {products?.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-card py-20 px-8 text-center border border-border">
                <Image
                  className="mb-6 opacity-80"
                  src="/no-result.svg"
                  alt="No results"
                  width={260}
                  height={250}
                />
                <h2 className="text-xl font-bold text-foreground mb-2">
                  No products found
                </h2>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                  Try adjusting your search or filter to find what you&apos;re
                  looking for.
                </p>
                <Button
                  variant="create"
                  className="rounded-xl"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-3 lg:gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
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
                  <div className="mt-10 text-center">
                    <Button
                      onClick={loadMore}
                      disabled={loadingMore}
                      variant="outline"
                      size="lg"
                      className="min-w-50 rounded-xl"
                    >
                      {loadingMore ? "Loading..." : "Load More Products"}
                    </Button>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Showing {products.length} of {totalDoc} products
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

export default dynamic(() => Promise.resolve(SearchScreenNew), { ssr: false });
