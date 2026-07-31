"use client";
import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import DiscountedCard from "@components/product/DiscountedCard";
import useUtilsFunction from "@hooks/useUtilsFunction";

const DEFAULT_HERO = {
  watermark: "FreshMart",
  offerLabel: "Exclusive offer",
  offerBadge: "25% OFF",
  heading: "Fast Fresh Groceries Delivered Daily",
  description:
    "From breakfast items to fresh ingredients, get quality groceries quickly and conveniently.",
  buttonText: "Shop Now",
  buttonLink: "/search?category=fresh-vegetables",
  image: "https://i.ibb.co.com/XxFqFFtT/hero-shopping-img.png",
};

const ModernHero = ({ discountedProducts, attributes, storeCustomizationSetting }) => {
  const { showingTranslateValue } = useUtilsFunction();
  const home = storeCustomizationSetting?.home;

  const watermarkText =
    showingTranslateValue(home?.modern_hero_title) || DEFAULT_HERO.watermark;
  const offerLabel =
    showingTranslateValue(home?.modern_hero_offer_label) || DEFAULT_HERO.offerLabel;
  const offerBadge = home?.modern_hero_offer_badge || DEFAULT_HERO.offerBadge;
  const heroHeading =
    showingTranslateValue(home?.modern_hero_heading) || DEFAULT_HERO.heading;
  const heroDescription =
    showingTranslateValue(home?.modern_hero_subtitle) || DEFAULT_HERO.description;
  const buttonText =
    showingTranslateValue(home?.modern_hero_button_text) || DEFAULT_HERO.buttonText;
  const buttonLink = home?.modern_hero_button_link || DEFAULT_HERO.buttonLink;
  const heroImage = home?.modern_hero_image || DEFAULT_HERO.image;

  return (
    <div className="relative bg-gradient-to-b from-primary via-background via-50% to-muted/10">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 mb-8 relative z-0">
        <div className="relative w-full overflow-hidden rounded-lg min-h-[450px] sm:min-h-[550px] lg:min-h-[580px] flex items-center justify-center">

          {/* Large Background Watermark Text */}
          <div className="absolute top-4 lg:top-4 left-0 w-full flex justify-center text-center pointer-events-none select-none z-0">
            <span
              className="text-[100px] sm:text-[140px] md:text-[180px] lg:text-[210px] xl:text-[250px] font-serif font-bold text-primary/8 leading-[0.6] tracking-tighter relative drop-shadow-sm"
              style={{ fontFamily: "'Georgia', sans-serif" }}
            >
              {watermarkText}
            </span>
          </div>

          {/* Content Container */}
          <div className="relative z-10 w-full h-full min-h-[500px] sm:min-h-[600px] lg:min-h-[620px] flex flex-col lg:flex-row items-center lg:items-end lg:justify-between">

            {/* Left Text and CTA */}
            <div className="lg:w-[38%] flex flex-col items-center lg:items-start text-center lg:text-left lg:pb-20 order-0 lg:order-1 mt-auto lg:mt-0 z-30 px-4 lg:px-0">

              {/* Row 1: Offer label + badge pill */}
              <div className="flex items-center gap-2 mb-3">
                <span className="font-semibold text-sm sm:text-base">
                  {offerLabel}
                </span>
                {offerBadge && (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700 dark:bg-red-400/10 dark:text-red-400">
                    {offerBadge}
                  </span>
                )}
              </div>

              {/* Row 2: Main large heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-3">
                {heroHeading}
              </h1>

              {/* Row 3: Short description */}
              <p className="text-base mb-6 max-w-xs lg:max-w-sm">
                {heroDescription}
              </p>

              {/* Row 4: CTA Button */}
              <Link href={buttonLink}>
                <button className="bg-primary hover:bg-primary/80 text-white rounded-full pl-6 pr-2 py-2 flex items-center justify-between gap-4 font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  <span>{buttonText}</span>
                  <span className="bg-white text-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </span>
                </button>
              </Link>
            </div>

            {/* Center Image */}
            <div className="lg:absolute lg:bottom-0 lg:left-1/2 lg:-translate-x-1/2 w-[85%] sm:w-[350px] md:w-[400px] lg:w-[480px] xl:w-[550px] flex justify-center items-end order-1 lg:order-2 z-20 pointer-events-none mt-10 lg:mt-0">
              <img
                src={heroImage}
                alt="Hero"
                className="w-full h-auto object-contain drop-shadow-2xl max-h-[400px] lg:max-h-[600px] object-bottom"
              />
            </div>

            {/* Right Floating Card Slider */}
            <div className="hidden lg:flex lg:w-[280px] xl:w-[280px] justify-end items-end pb-6 lg:pb-12 order-3 z-30">
              {discountedProducts?.length > 0 ? (
                <div className="w-full">
                  <Swiper
                    spaceBetween={10}
                    slidesPerView={1}
                    autoplay={{
                      delay: 3500,
                      disableOnInteraction: false,
                    }}
                    modules={[Autoplay]}
                  >
                    {discountedProducts.slice(0, 5).map((product) => (
                      <SwiperSlide key={product._id} className="bg-transparent pb-3">
                        <DiscountedCard product={product} attributes={attributes} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              ) : null}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernHero;
