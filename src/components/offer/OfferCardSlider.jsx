"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import DiscountedCard from "@components/product/DiscountedCard";

/**
 * Vertical, slow-autoplay carousel of full product cards for the "Latest
 * Offers" slot beside the hero banner — same DiscountedCard used in the
 * "Latest Deals" grid further down the page, just one at a time, sliding
 * the way MainCarousel's hero slides do (only vertically, to fit this
 * slot's narrow, fixed-height column).
 */
const OfferCardSlider = ({ products, attributes }) => {
  return (
    <Swiper
      direction="vertical"
      slidesPerView={1}
      spaceBetween={12}
      loop={products.length > 1}
      autoplay={{
        delay: 3500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      speed={800}
      modules={[Autoplay]}
      className="h-full w-full"
    >
      {products.map((product) => (
        <SwiperSlide key={product._id} className="h-full">
          <DiscountedCard product={product} attributes={attributes} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default OfferCardSlider;
