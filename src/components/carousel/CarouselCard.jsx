"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const formatMoney = (n) => {
  const num = Number(n) || 0;
  return `$${num.toFixed(2)}`;
};

const CarouselCard = ({ storeCustomizationSetting, sliderData }) => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2000,
        disableOnInteraction: false,
      }}
      loop={true}
      pagination={
        (storeCustomizationSetting?.slider?.bottom_dots ||
          storeCustomizationSetting?.slider?.both_slider) && {
          clickable: true,
        }
      }
      navigation={
        (storeCustomizationSetting?.slider?.left_right_arrow ||
          storeCustomizationSetting?.slider?.both_slider) && {
          clickable: true,
        }
      }
      modules={[Autoplay, Pagination, Navigation]}
      className="mySwiper"
    >
      {sliderData?.map((item, i) => (
        <SwiperSlide
          className="h-full relative rounded-lg overflow-hidden dark:bg-background"
          key={i + 1}
        >
          {/* Height kept in sync with OfferCard's "Latest Offers" slot
              beside this banner — both sections must match. */}
          <div className="relative h-[640px] sm:h-[700px] lg:h-[760px] w-full text-sm text-muted-foreground hover:text-primary dark:bg-background">
            <Image
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              src={item.image}
              alt={item.title}
              className={item.fit === "contain" ? "bg-white object-contain" : "object-cover"}
              priority
            />
            {/* Legibility scrim — needed when the slide is a real (often
                white-background) product photo rather than a designed
                banner graphic. */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          </div>
          <div className="absolute top-0 left-0 z-10 p-r-16 flex-col flex w-full h-full place-items-start justify-center">
            <div className="pl-4 pr-12 sm:pl-10 sm:pr-16 w-10/12 lg:w-8/12 xl:w-7/12">
              {item.badge && (
                <span className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  {item.badge}
                </span>
              )}
              <h1 className="mb-2  text-xl sm:text-lg md:text-2xl line-clamp-1 md:line-clamp-none  lg:line-clamp-none  lg:text-3xl font-bold text-white drop-shadow">
                {item.title}
              </h1>
              {item.price ? (
                <div className="mb-1 flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-xl md:text-3xl font-bold text-white drop-shadow">
                    {formatMoney(item.price.price)}
                  </span>
                  {item.price.discount > 0 && (
                    <>
                      <span className="text-base text-white/70 line-through">
                        {formatMoney(item.price.originalPrice)}
                      </span>
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                        -{item.price.discount}%
                      </span>
                    </>
                  )}
                </div>
              ) : null}
              <p className="text-base leading-6 text-white/90 font-sans line-clamp-1  md:line-clamp-none lg:line-clamp-none drop-shadow">
                {item.info}
              </p>
              <Link
                href={item.url}
                className="hidden sm:inline-block lg:inline-block text-sm leading-6 font-medium mt-6 px-6 py-2 bg-primary text-center rounded-lg text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {item.buttonName}
              </Link>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default CarouselCard;
