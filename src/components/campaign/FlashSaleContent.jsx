"use client";

import { useState } from "react";
import {
  Flame,
  Clock,
  Layers,
  SlidersHorizontal,
  Package,
  TrendingUp,
  Sparkles,
} from "lucide-react";

//internal import
import CampaignCountdown from "@components/campaign/CampaignCountdown";
import CampaignProductCard from "@components/campaign/CampaignProductCard";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ImageWithFallback from "@components/common/ImageWithFallBack";

const FlashSaleContent = ({ campaigns, attributes }) => {
  const { showingTranslateValue } = useUtilsFunction();
  const [activeTab, setActiveTab] = useState("all");

  const now = new Date();
  const activeCampaigns = campaigns.filter(
    (c) => new Date(c.startTime) <= now && new Date(c.endTime) >= now,
  );
  const upcomingCampaigns = campaigns.filter(
    (c) => new Date(c.startTime) > now,
  );

  const displayCampaigns =
    activeTab === "active"
      ? activeCampaigns
      : activeTab === "upcoming"
        ? upcomingCampaigns
        : campaigns;

  const tabs = [
    {
      key: "all",
      label: "All Campaigns",
      count: campaigns.length,
      icon: Layers,
      activeColor:
        "bg-primary text-primary-foreground shadow-lg shadow-primary/25",
    },
    {
      key: "active",
      label: "Live Now",
      count: activeCampaigns.length,
      icon: Flame,
      activeColor: "bg-red-500 text-white shadow-lg shadow-red-500/25",
    },
    {
      key: "upcoming",
      label: "Coming Soon",
      count: upcomingCampaigns.length,
      icon: Clock,
      activeColor: "bg-orange-500 text-white shadow-lg shadow-orange-500/25",
    },
  ];

  return (
    <div>
      {/* ── Filter Bar ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-10 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-3">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${activeTab === tab.key
                  ? tab.activeColor
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span
                className={`inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-xs font-bold ${activeTab === tab.key
                    ? "bg-white/20 text-inherit"
                    : "bg-background text-muted-foreground"
                  }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Campaigns List ──────────────────────────────────────── */}
      {displayCampaigns.length > 0 ? (
        <div className="space-y-10">
          {displayCampaigns.map((campaign) => {
            const isActive =
              new Date(campaign.startTime) <= now &&
              new Date(campaign.endTime) >= now;
            const isUpcoming = new Date(campaign.startTime) > now;
            const productCount = campaign.products?.length || 0;
            const soldCount =
              campaign.products?.reduce(
                (sum, p) => sum + (p.soldCount || 0),
                0,
              ) || 0;

            return (
              <div
                key={campaign._id}
                className="rounded-2xl border border-border bg-card overflow-hidden transition-shadow duration-300 hover:shadow-xl"
              >
                {/* ── Campaign Banner ───────────────────────── */}
                {campaign.banner ? (
                  <div className="relative overflow-hidden">
                    <ImageWithFallback
                      src={campaign.banner}
                      alt={showingTranslateValue(campaign.title)}
                      width={1200}
                      height={350}
                      className="w-full h-36 sm:h-44 md:h-56 object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Status badge */}
                    <div className="absolute top-4 left-4">
                      {isActive && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          LIVE
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500 text-white text-xs font-bold shadow-lg">
                          <Clock className="w-3 h-3" />
                          UPCOMING
                        </span>
                      )}
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
                      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-2 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-0.5 sm:mb-1.5 drop-shadow-md line-clamp-1">
                            {showingTranslateValue(campaign.title)}
                          </h2>
                          {campaign.description && (
                            <p className="text-white/80 text-xs sm:text-sm max-w-lg line-clamp-2">
                              {showingTranslateValue(campaign.description)}
                            </p>
                          )}
                        </div>
                        <CampaignCountdown
                          endTime={campaign.endTime}
                          startTime={campaign.startTime}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── Campaign Header (no banner) ────────── */
                  <div className="p-6 border-b border-border/50">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-2xl ${isActive
                              ? "bg-red-500/10 text-red-500"
                              : isUpcoming
                                ? "bg-orange-500/10 text-orange-500"
                                : "bg-muted text-muted-foreground"
                            }`}
                        >
                          {isActive ? (
                            <Flame className="w-6 h-6" />
                          ) : (
                            <Sparkles className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h2 className="text-xl md:text-2xl font-bold text-foreground">
                              {showingTranslateValue(campaign.title)}
                            </h2>
                            {isActive && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                LIVE
                              </span>
                            )}
                            {isUpcoming && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold">
                                <Clock className="w-3 h-3" />
                                Soon
                              </span>
                            )}
                          </div>
                          {campaign.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {showingTranslateValue(campaign.description)}
                            </p>
                          )}
                        </div>
                      </div>
                      <CampaignCountdown
                        endTime={campaign.endTime}
                        startTime={campaign.startTime}
                      />
                    </div>
                  </div>
                )}

                {/* ── Products Grid ─────────────────────────── */}
                <div className="p-4 md:p-6">
                  {campaign.products && campaign.products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 md:gap-4">
                      {campaign.products.map((cp, index) => (
                        <CampaignProductCard
                          key={cp.product?._id || index}
                          campaignProduct={cp}
                          campaignId={campaign._id}
                          attributes={attributes}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="font-medium">
                        No products in this campaign yet
                      </p>
                    </div>
                  )}
                </div>

                {/* ── Campaign Stats Footer ─────────────────── */}
                <div className="px-6 py-3 bg-muted/30 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    {productCount} {productCount === 1 ? "product" : "products"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {soldCount} sold
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Empty state ──────────────────────────────────── */
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
            {activeTab === "active" ? (
              <Flame className="w-10 h-10 text-red-400" />
            ) : activeTab === "upcoming" ? (
              <Clock className="w-10 h-10 text-orange-400" />
            ) : (
              <Layers className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No {activeTab === "all" ? "" : activeTab} campaigns found
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {activeTab === "active"
              ? "There are no active campaigns right now. Check upcoming deals!"
              : activeTab === "upcoming"
                ? "No upcoming campaigns scheduled yet."
                : "Check back later for amazing deals!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default FlashSaleContent;
