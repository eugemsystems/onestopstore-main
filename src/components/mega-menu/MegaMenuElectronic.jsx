"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDownIcon, Monitor, Smartphone, Cpu } from "lucide-react";
import useUtilsFunction from "@hooks/useUtilsFunction";

const MegaMenuElectronic = ({ categories, categoryError }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const { showingTranslateValue } = useUtilsFunction();

  const topCategories = categories?.[0]?.children || [];

  return (
    <div className="relative group">
      {/* Temu-style Categories pill trigger */}
      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-primary-foreground/25 text-sm font-semibold text-primary-foreground transition-colors focus:outline-none">
        <span>Categories</span>
        <ChevronDownIcon className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-200" />
      </button>

      {/* Mega Menu Dropdown — always left-aligned */}
      <div className="shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-0 top-full mt-3 z-50 w-[900px] transition-all duration-200 ease-in-out">
        <div className="absolute -top-2 left-6 h-4 w-4 rotate-45 bg-white border-l border-t border-gray-100"></div>
        <div className="overflow-hidden rounded-xl">
          <div className="flex h-[70vh] bg-white text-sm">
            {/* Left: Category Sidebar */}
            <div className="w-64 shrink-0 border-r border-gray-100 overflow-y-auto bg-gray-50 py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-50 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
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
                      <div className="w-[22px] h-[22px] rounded bg-primary/10 flex items-center justify-center">
                        <Cpu className="h-3 w-3 text-primary" />
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
            </div>

            {/* Right: Content Area */}
            <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-50 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
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
                      href={`/search?_id=${activeCategory._id}`}
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
                          href={`/search?_id=${sub._id}`}
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
                              <Smartphone className="h-4 w-4 text-primary" />
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

                  {/* Tech Deals Banner */}
                  <div className="mt-5 rounded-lg bg-linear-to-r from-primary/5 to-primary/10 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">
                        ⚡ Tech Deals
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        Save big on {showingTranslateValue(activeCategory.name)}
                      </p>
                    </div>
                    <Link
                      href="/offers"
                      className="text-xs font-semibold text-primary-foreground bg-primary px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Shop Deals
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
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
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    Explore Electronics
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Hover over a department to browse products and find the best
                    tech deals
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

export default MegaMenuElectronic;
