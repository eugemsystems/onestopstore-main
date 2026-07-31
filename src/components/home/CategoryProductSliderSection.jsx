"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// internal imports
import ProductCard from "@components/product/ProductCard";
import useUtilsFunction from "@hooks/useUtilsFunction";

/**
 * Client component — renders a product slider section for a single category
 */
const CategoryProductSliderSection = ({ slider, attributes }) => {
  const { showingTranslateValue } = useUtilsFunction();
  const sliderRef = useRef(null);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  if (!slider || !slider.products || slider.products.length === 0) return null;

  // Derive the category name for display (could be an object for multilingual)
  const categoryName =
    typeof slider.category?.name === "object"
      ? showingTranslateValue(slider.category.name)
      : slider.category?.name || "";

  // Build the "View All" href — store uses /search?_id=<categoryId>
  const viewAllHref = slider.category?._id
    ? `/search?_id=${slider.category._id}`
    : "/search";

  return (
    <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 py-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground">
            {slider.title || categoryName}
          </h2>
          {slider.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {slider.description}
            </p>
          )}
        </div>
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          View All Products
        </Link>
      </div>

      {/* Slider */}
      <div className="relative">
        {/* Prev Arrow */}
        <button
          onClick={handlePrev}
          className="prev cursor-pointer absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-card text-gray-700 dark:text-foreground hover:bg-gray-100 dark:hover:bg-muted shadow-md z-10 transition-all border border-border/50"
          aria-label="Scroll left"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>

        {/* Next Arrow */}
        <button
          onClick={handleNext}
          className="next cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-card text-gray-700 dark:text-foreground hover:bg-gray-100 dark:hover:bg-muted shadow-md z-10 transition-all border border-border/50"
          aria-label="Scroll right"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>

        <Swiper
          ref={sliderRef}
          spaceBetween={16}
          slidesPerView={2}
          breakpoints={{
            480: { slidesPerView: 2, spaceBetween: 16 },
            640: { slidesPerView: 3, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 16 },
            1024: { slidesPerView: 4, spaceBetween: 20 },
            1280: { slidesPerView: 5, spaceBetween: 20 },
          }}
          autoplay={
            slider.autoPlay
              ? { delay: 3000, disableOnInteraction: false }
              : false
          }
          modules={slider.autoPlay ? [Autoplay] : []}
          className="mySwiper px-1! py-3!"
        >
          {slider.products.map((product, index) => (
            <SwiperSlide key={product._id || index}>
              <ProductCard product={product} attributes={attributes} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default CategoryProductSliderSection;
