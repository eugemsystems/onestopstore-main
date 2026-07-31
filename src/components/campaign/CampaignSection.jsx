"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight, FiEye } from "react-icons/fi";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

//internal import
import CampaignCountdown from "@components/campaign/CampaignCountdown";
import CampaignProductCard from "@components/campaign/CampaignProductCard";
import useUtilsFunction from "@hooks/useUtilsFunction";

const CampaignSection = ({ campaign, attributes }) => {
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

  if (!campaign || !campaign.products || campaign.products.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 py-10 lg:py-12">
      <div className="relative border border-dashed border-red-200 rounded-xl bg-red-50 p-10">
        {/* Campaign Header - Centered */}
        <div className="flex flex-col items-center justify-center mb-4 gap-3">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
            {showingTranslateValue(campaign.title)}
          </h2>
          <CampaignCountdown
            endTime={campaign.endTime}
            startTime={campaign.startTime}
          />
        </div>

        {/* Campaign Products Slider */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="prev cursor-pointer swiper-indicator absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-700 hover:bg-gray-100 shadow-md z-10 [&.swiper-button-lock]:hidden"
            aria-label="Scroll left"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="next cursor-pointer swiper-indicator absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-700 hover:bg-gray-100 shadow-md z-10 [&.swiper-button-lock]:hidden"
            aria-label="Scroll right"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>

          {/* Scrollable container */}
          <Swiper
            ref={sliderRef}
            spaceBetween={16}
            slidesPerView={2}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 5 },
              1536: { slidesPerView: 5 },
            }}
            className="mySwiper"
          >
            {campaign.products.slice(0, 12).map((cp, index) => (
              <SwiperSlide key={cp.product?._id || index}>
                <CampaignProductCard
                  campaignProduct={cp}
                  campaignId={campaign._id}
                  attributes={attributes}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-4">
          <Link
            href="/flash-sale"
            className="relative h-auto flex items-center font-semibold text-sm shadow-sm hover:text-white text-gray-600 justify-center rounded-full transition-colors py-3 px-5 bg-gray-50 hover:bg-primary"
          >
            <FiEye className="w-4 h-4 mr-2" />
            View All Campaign Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampaignSection;
