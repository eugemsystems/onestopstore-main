"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IoAdd,
  IoRemove,
  IoExpand,
  IoBagAdd,
  IoHeart,
  IoHeartOutline,
  IoImages,
  IoRepeat,
} from "react-icons/io5";
import { useCart } from "react-use-cart";
import { Expand } from "lucide-react";
import dynamic from "next/dynamic";

//internal import
import Price from "@components/common/Price";
import Stock from "@components/common/Stock";
import { notifyError } from "@utils/toast";
import Rating from "@components/common/Rating";
import useAddToCart from "@hooks/useAddToCart";
import { useSetting } from "@context/SettingContext";
import { useCurrency } from "@context/CurrencyContext";
import { useWishlist } from "@context/WishlistContext";
import Discount from "@components/common/Discount";
import { handleLogEvent } from "src/lib/analytics";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ProductModal from "@components/modal/ProductModal";
import ImageWithFallback from "@components/common/ImageWithFallBack";
import ProductLink from "@components/common/ProductLink";
import ProductVariantIndicator from "@components/product/ProductVariantIndicator";
import ProductCardMeta from "@components/product/ProductCardMeta";
import { getFromPrice } from "@utils/getFromPrice";
import { canAddToCart } from "@utils/cartGuards";

const ProductCard = ({ product, attributes, compact = false }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const { globalSetting } = useSetting();
  const { selectedCurrency } = useCurrency();
  const { isWishlisted, toggleWishlist, addProductToCompare } = useWishlist();

  const { items, addItem, updateItemQuantity, inCart } = useCart();
  const { handleIncreaseQuantity } = useAddToCart();
  const { showingTranslateValue, getNumber } = useUtilsFunction();

  const currency = globalSetting?.default_currency || "$";

  // Region-restricted products only sell under a specific currency
  // (mirrors the legacy frontend's zambia_only/zimbabwe_only/sa_only gate).
  const currencyCode = (selectedCurrency?.code || "USD").toUpperCase();
  const r = product?.raines || {};
  const shouldHideProduct =
    (r.zambiaOnly && currencyCode !== "ZMW") ||
    (r.zimbabweOnly && currencyCode !== "USD") ||
    (r.saOnly && currencyCode !== "ZAR");

  if (shouldHideProduct) return null;

  // Resolve campaign data from the product (enriched by backend)
  const campaign = product?.campaign || null;
  const isInCampaign = !!(campaign && campaign.inCampaign !== false);

  // Get effective price and stock for display — for products with
  // variations, show the cheapest variant ("From $X") rather than
  // whichever one happens to be first in the list.
  const fromPrice = getFromPrice(product);
  const effectivePrice = isInCampaign
    ? campaign.campaignPrice
    : fromPrice.price;
  const effectiveOriginalPrice = isInCampaign
    ? campaign.campaignOriginalPrice
    : fromPrice.originalPrice;
  const effectiveStock = isInCampaign
    ? campaign.campaignRemainingStock
    : product?.stock;

  const handleAddItem = (p) => {
    const stockToCheck = isInCampaign
      ? campaign.campaignRemainingStock
      : p.stock;
    if (stockToCheck < 1) return notifyError("Insufficient stock!");

    if (p?.variants?.length > 0) {
      // Variant products can't be added straight from the card/grid — the
      // user must open the product page and choose a variation there first.
      router.push(`/product/${product?.slug}`);
      return;
    }
    const {
      variants,
      categories,
      description,
      campaign: _c,
      ...updatedProduct
    } = product;
    const newItem = {
      ...updatedProduct,
      title: showingTranslateValue(p?.title),
      id: p._id,
      variant: isInCampaign
        ? { ...p.prices, price: campaign.campaignPrice }
        : p.prices,
      price: isInCampaign ? campaign.campaignPrice : p.prices.price,
      originalPrice: isInCampaign
        ? campaign.campaignOriginalPrice
        : product.prices?.originalPrice,
      ...(isInCampaign
        ? {
          campaignId: campaign.campaignId,
          campaignPrice: campaign.campaignPrice,
          inCampaign: true,
          campaignRemainingStock: campaign.campaignRemainingStock,
        }
        : {}),
    };
    if (!inCart(newItem.id)) {
      const guard = canAddToCart(items, newItem);
      if (!guard.ok) return notifyError(guard.message);
    }
    addItem(newItem);
  };

  const handleModalOpen = (event, id) => {
    setModalOpen(event);
  };

  return (
    <>
      {modalOpen && (
        <ProductModal
          product={product}
          modalOpen={modalOpen}
          attributes={attributes}
          globalSetting={globalSetting}
          setModalOpen={setModalOpen}
          campaignInfo={isInCampaign ? campaign : null}
        />
      )}

      <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1 hover:border-primary/50 ">
        <div className="w-full flex justify-between">
          <Discount product={product} />
        </div>

        {/* Wishlist / Compare — mirrors the legacy card's stacked action
            buttons (AddToWishlist.jsx / AddToCompareNew.jsx) */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <button
            type="button"
            aria-label="wishlist"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 shadow-lg shadow-rose-900/20 ring-1 ring-rose-100 text-rose-500 transition-colors hover:bg-rose-100 hover:text-rose-600 dark:bg-background dark:ring-border"
          >
            {isWishlisted(product.id) ? (
              <IoHeart className="text-rose-600" />
            ) : (
              <IoHeartOutline />
            )}
          </button>
          <button
            type="button"
            aria-label="compare"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addProductToCompare(product.id);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 shadow-lg shadow-sky-900/20 ring-1 ring-sky-100 text-sky-500 transition-colors hover:bg-sky-100 hover:text-sky-600 dark:bg-background dark:ring-border"
          >
            <IoRepeat />
          </button>
        </div>

        <div
          className={`relative w-full border-b border-border/70 ${
            compact ? "h-24 xl:h-28" : "h-48 xl:h-52"
          }`}
        >
          <ProductLink
            href={`/product/${product?.slug}`}
            className="absolute inset-0 overflow-hidden bg-white"
          >
            <ImageWithFallback
              fill
              fit="contain"
              sizes="100%"
              alt="product"
              className="p-5"
              src={product.image?.[0]}
            />
          </ProductLink>

          {/* Image count badge (camera icon) — legacy card's gallery indicator */}
          {product?.imageCount > 0 && (
            <div className="absolute bottom-3 left-3 z-[5] flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              <IoImages size={10} />
              <span>{product.imageCount}</span>
            </div>
          )}

          <div className="absolute lg:bottom-0 bottom-4 lg:group-hover:bottom-4 inset-x-1 opacity-100 flex justify-center lg:opacity-0 lg:invisible group-hover:opacity-100 group-hover:visible transition-all">
            <button
              aria-label="quick view"
              onClick={() => {
                handleModalOpen(!modalOpen, product._id);
                handleLogEvent(
                  "product",
                  `opened ${showingTranslateValue(
                    product?.title,
                  )} product modal`,
                );
              }}
              className="relative h-auto inline-flex items-center cursor-pointer justify-center rounded-full transition-colors text-xs py-2 px-4 bg-background text-muted-foreground dark:bg-background dark:text-muted-foreground hover:text-primary hover:bg-muted dark:hover:bg-accent shadow-lg focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary dark:focus:ring-offset-0"
            >
              <IoExpand />
              <span className="ms-1 hidden xl:block lg:block">Quick View</span>
            </button>
          </div>

          <div className="absolute bottom-3 right-3 z-[5] flex items-center justify-center rounded-full bg-background text-muted-foreground shadow-lg transition-all duration-300 ease-in-out hover:bg-muted hover:text-primary">
            {inCart(product._id) ? (
              <div>
                {items.map(
                  (item) =>
                    item.id === product._id && (
                      <div
                        key={item.id}
                        className="flex flex-col w-10 h-20 items-center p-1 justify-between bg-primary text-primary-foreground ring-2 ring-white rounded-full"
                      >
                        <button
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <span className="text-xl cursor-pointer">
                            <IoRemove />
                          </span>
                        </button>
                        <p className="text-sm px-1 font-medium">
                          {item.quantity}
                        </p>
                        <button
                          onClick={() =>
                            item?.variants?.length > 0
                              ? handleAddItem(item)
                              : handleIncreaseQuantity(item)
                          }
                        >
                          <span className="text-lg cursor-pointer">
                            <IoAdd />
                          </span>
                        </button>
                      </div>
                    ),
                )}{" "}
              </div>
            ) : (
              <button
                onClick={() => handleAddItem(product)}
                aria-label="cart"
                className="w-10 h-10 flex items-center justify-center rounded-full cursor-pointer border-2 bg-primary text-primary-foreground border-primary font-medium transition-colors duration-300 hover:bg-primary/90 hover:border-primary hover:text-primary-foreground focus:border-primary focus:bg-primary focus:text-primary-foreground"
              >
                {" "}
                <IoBagAdd className="text-xl" />
              </button>
            )}
          </div>
        </div>

        {/* product info start */}
        <div
          className={`flex flex-1 flex-col ${
            compact ? "px-2.5 pt-2 pb-2.5" : "px-4 pt-3 pb-4"
          }`}
          style={{
            backgroundImage:
              "linear-gradient(to bottom, #fff, color-mix(in oklab, lab(56 94.47 98.89) 10%, #03a9f452))",
          }}
        >
          {/* Brand link — legacy card links to a collections/brand filter */}
          {!compact && product?.brand?.name && (
            <Link
              href={{ pathname: "/shop", query: { brand: product.brand.slug || product.brand.id } }}
              className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground hover:text-primary"
            >
              {product.brand.name}
            </Link>
          )}

          <ProductLink
            href={`/product/${product?.slug}`}
            className={`text-sm font-medium text-foreground line-clamp-1 hover:text-primary ${compact ? "mb-1" : "mb-1.5"}`}
          >
            {showingTranslateValue(product?.title)}
          </ProductLink>

          {!compact && (
            <div className="mb-2 flex items-center gap-0.5">
              <Rating
                size="md"
                showReviews={true}
                rating={product?.average_rating}
                totalReviews={product?.total_reviews}
              />
            </div>
          )}

          {!compact && (
            <div className="mb-2">
              <ProductVariantIndicator product={product} />
            </div>
          )}

          <div
            className={`flex items-baseline gap-2 rounded-lg bg-background/80 ring-1 ring-inset ring-border/60 ${
              compact ? "mb-0 px-2 py-1" : "mb-2.5 px-2.5 py-1.5"
            }`}
          >
            <Price
              card
              product={product}
              price={effectivePrice}
              originalPrice={effectiveOriginalPrice}
              campaign={isInCampaign ? campaign : null}
              isFrom={!isInCampaign && fromPrice.isFrom}
            />
          </div>

          {/* Stock status — only shown when NOT simply in stock */}
          {!compact && r.stockStatus && r.stockStatus !== "in_stock" && (
            <div className="mb-2 flex items-center gap-1 text-[10px] text-red-600">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-600" />
              {r.stockStatus.replace(/_/g, " ")}
            </div>
          )}

          {/* Campaign sold bar */}
          {!compact && isInCampaign && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
                <span>{campaign.campaignSoldCount || 0} Sold</span>
                <span>
                  {campaign.campaignSoldCount || 0}/
                  {campaign.campaignStockLimit}
                </span>
              </div>
              <div className="relative w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${campaign.campaignStockLimit > 0 ? Math.min(Math.round(((campaign.campaignSoldCount || 0) / campaign.campaignStockLimit) * 100), 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Delivery estimate + layby eligibility */}
          {!compact && (
            <div className="mt-auto pt-1">
              <ProductCardMeta product={product} />
            </div>
          )}
        </div>
        {/* product info end */}
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(ProductCard), { ssr: false });
