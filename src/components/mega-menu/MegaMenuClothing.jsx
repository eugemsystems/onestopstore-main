"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDownIcon } from "lucide-react";
import useUtilsFunction from "@hooks/useUtilsFunction";

const MegaMenuClothing = ({ categories, categoryError }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const { showingTranslateValue } = useUtilsFunction();

  const topCategories = categories?.[0]?.children || [];

  return (
    <div className="relative group">
      <button className="inline-flex items-center py-2 text-sm font-medium hover:text-primary focus:outline-none transition-colors">
        <span>Shop by Category</span>
        <ChevronDownIcon className="ml-1 h-3 w-3 group-hover:rotate-180 transition-transform duration-200" />
      </button>

      {/* Mega Menu Dropdown */}
      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-0 top-full z-50 w-[800px] transition-all duration-200 ease-in-out">
        <div className="mt-1 rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
          <div className="flex">
            {/* Left: Category List */}
            <div className="w-56 border-r border-border bg-muted/50 py-4">
              <h3 className="px-5 pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </h3>
              <div className="space-y-0.5">
                {topCategories.map((category) => (
                  <button
                    key={category._id}
                    onMouseEnter={() => setActiveCategory(category)}
                    className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm text-left transition-colors ${
                      activeCategory?._id === category._id
                        ? "bg-background text-primary font-medium border-r-2 border-primary"
                        : "text-foreground hover:bg-background hover:text-primary"
                    }`}
                  >
                    {category.icon && (
                      <Image
                        src={category.icon}
                        alt={showingTranslateValue(category.name)}
                        width={20}
                        height={20}
                        className="rounded"
                      />
                    )}
                    <span>{showingTranslateValue(category.name)}</span>
                    {category.children?.length > 0 && (
                      <ChevronDownIcon className="ml-auto h-3 w-3 -rotate-90" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Subcategories + Featured */}
            <div className="flex-1 p-6">
              {activeCategory ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      {showingTranslateValue(activeCategory.name)}
                    </h3>
                    <Link
                      href={`/search?_id=${activeCategory._id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View All →
                    </Link>
                  </div>

                  {activeCategory.children?.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {activeCategory.children.map((sub) => (
                        <Link
                          key={sub._id}
                          href={`/search?_id=${sub._id}`}
                          className="group/item flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors"
                        >
                          {sub.icon && (
                            <Image
                              src={sub.icon}
                              alt={showingTranslateValue(sub.name)}
                              width={32}
                              height={32}
                              className="rounded-md"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground group-hover/item:text-primary">
                              {showingTranslateValue(sub.name)}
                            </p>
                            {sub.children?.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {sub.children.length} sub-categories
                              </p>
                            )}
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

                  {/* Featured Banner */}
                  <div className="mt-6 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                      Trending Now
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      Explore the latest arrivals in{" "}
                      {showingTranslateValue(activeCategory.name)}
                    </p>
                    <Link
                      href={`/search?_id=${activeCategory._id}`}
                      className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                    >
                      Shop Now →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="text-4xl mb-3">👗</div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Explore Our Collections
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Hover over a category to discover subcategories and trending
                    items
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

export default MegaMenuClothing;
