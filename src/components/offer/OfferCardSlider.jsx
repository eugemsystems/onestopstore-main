"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import OfferProductCard from "@components/offer/OfferProductCard";

/**
 * Horizontal, slow-autoplay carousel of compact product cards for the
 * "Latest Offers" slot beside the hero banner, sliding the same way
 * MainCarousel's hero slides do. Cards use `slidesPerView="auto"` with a
 * fixed width (170px / 200px) matching the card width used in every other
 * horizontal product row on the homepage (see ProductRowSection.jsx) —
 * NOT stretched to fill the container, which is what made them look
 * oversized before.
 */
const OfferCardSlider = ({ products }) => {
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
          <OfferProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default OfferCardSlider;
