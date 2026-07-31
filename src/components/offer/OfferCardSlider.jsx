"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import ProductCard from "@components/product/ProductCard";

/**
 * Horizontal, slow-autoplay carousel of the SAME product card used in every
 * other homepage row (Best Sellers, New Arrivals, Flash Sale, Category
 * Deals — see ProductRowSection.jsx), for the "Latest Offers" slot beside
 * the hero banner.
 *
 * slidesPerView={2} (a fixed number, not "auto") — Swiper divides the
 * MEASURED container width by 2, so the track can never be wider than the
 * container, unlike slidesPerView="auto" which sizes the track by summing
 * every slide's natural width and blew out past the container edge. Each
 * card is then centered at its normal 170px/200px width inside its slide
 * (matching ProductRowSection's width) rather than stretched to fill it.
 */
const OfferCardSlider = ({ products, attributes }) => {
  return (
    <Swiper
      slidesPerView={2}
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
        <SwiperSlide
          key={product._id}
          className="h-full flex items-stretch justify-center"
        >
          <div className="w-[170px] sm:w-[200px] max-w-full h-full mx-auto">
            <ProductCard product={product} attributes={attributes} />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default OfferCardSlider;
