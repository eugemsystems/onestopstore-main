"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import FeatureCategoryModernCard from "./FeatureCategoryModernCard";

const FeatureCategorySlider = ({ categories, backgroundColors }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full relative">
      <Swiper
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 16 },
          768: { slidesPerView: 4, spaceBetween: 20 },
          1024: { slidesPerView: 5, spaceBetween: 24 },
          1280: { slidesPerView: 6, spaceBetween: 24 },
        }}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
        className="mySwiper !pb-4"
      >
        {categories.map((category, i) => {
          const bgClass = backgroundColors[i % backgroundColors.length];
          return (
            <SwiperSlide key={category._id || i} className="h-auto">
              <FeatureCategoryModernCard category={category} bgClass={bgClass} />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default FeatureCategorySlider;
