"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import OfferProductCard from "@components/offer/OfferProductCard";

/**
 * Horizontal, slow-autoplay carousel of compact product cards for the
 * "Latest Offers" slot beside the hero banner — two at a time, sliding the
 * same way MainCarousel's hero slides do.
 */
const OfferCardSlider = ({ products }) => {
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
        <SwiperSlide key={product._id} className="h-full">
          <OfferProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default OfferCardSlider;
