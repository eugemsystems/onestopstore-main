"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import ProductCard from "@components/product/ProductCard";

/**
 * Horizontal, slow-autoplay carousel of the SAME product card used in every
 * other homepage row (Best Sellers, New Arrivals, Flash Sale, Category
 * Deals — see ProductRowSection.jsx), for the "Latest Offers" slot beside
 * the hero banner. slidesPerView="auto" + a fixed 170px/200px slide width
 * matches ProductRowSection's own card width exactly, rather than
 * stretching cards to fill the container.
 */
const OfferCardSlider = ({ products, attributes }) => {
  return (
    <Swiper
      slidesPerView="auto"
      spaceBetween={8}
      loop={products.length > 2}
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
        <SwiperSlide key={product._id} className="!w-[170px] sm:!w-[200px] h-full">
          <ProductCard product={product} attributes={attributes} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default OfferCardSlider;
