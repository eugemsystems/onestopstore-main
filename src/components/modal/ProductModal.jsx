"use client";

import Link from "next/link";
import Image from "next/image";

import Price from "@components/common/Price";
import Tags from "@components/common/Tags";
import Discount from "@components/common/Discount";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Rating from "@components/common/Rating";
import Stock from "@components/common/Stock";
import useProductAction from "@hooks/useProductAction";
import { useSetting } from "@context/SettingContext";
import {
  FiEye,
  FiHeadphones,
  FiMinus,
  FiPlus,
  FiShoppingBag,
} from "react-icons/fi";
import MainModal from "./MainModal";

const ProductModal = ({
  product,
  modalOpen,
  setModalOpen,
  campaignInfo,
}) => {
  const { globalSetting } = useSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const {
    item,
    setItem,
    price,
    stock,
    discount,
    isReadMore,
    setIsReadMore,
    selectedImage,
    originalPrice,
    isFromPrice,
    requiresVariant,
    category_name,
    isInCampaign,
    campaign,
    handleAddToCart,
  } = useProductAction({
    product,
    globalSetting,
    campaignInfo,
    onCloseModal: () => setModalOpen(false),
    withRouter: true,
  });

  const description = showingTranslateValue(product?.description);
  const hasLongDescription = description?.length > 140;

  return (
    <MainModal
      modalOpen={modalOpen}
      handleCloseModal={() => setModalOpen(false)}
    >
      <div className="w-full min-w-0">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <Link
            href={`/product/${product.slug}`}
            onClick={() => setModalOpen(false)}
            className="w-full shrink-0 lg:w-[38%]"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={
                  selectedImage ||
                  product?.image?.[0] ||
                  "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                }
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                alt={showingTranslateValue(product?.title) || "product"}
                className="object-cover"
              />
            </div>
          </Link>

          <div className="min-w-0 flex-1">
            <div className="mb-3">
              <Stock In stock={stock} />
              <Link href={`/product/${product.slug}`} onClick={() => setModalOpen(false)}>
                <h2 className="mt-2 text-lg font-semibold text-foreground transition-colors hover:text-primary sm:text-xl">
                  {showingTranslateValue(product?.title)}
                </h2>
              </Link>
              <div className="mt-1.5">
                <Rating
                  size="md"
                  showReviews={true}
                  rating={product?.average_rating}
                  totalReviews={product?.total_reviews}
                />
              </div>
            </div>

            {description ? (
              <div className="mb-4">
                <p
                  className={`text-sm leading-6 text-muted-foreground ${
                    !isReadMore ? "line-clamp-3" : ""
                  }`}
                >
                  {description}
                </p>
                {hasLongDescription && (
                  <button
                    type="button"
                    onClick={() => setIsReadMore(!isReadMore)}
                    className="mt-1 text-xs font-medium text-primary hover:underline"
                  >
                    {isReadMore ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            ) : null}

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Price
                price={price}
                product={product}
                originalPrice={originalPrice}
                campaign={isInCampaign ? campaign : null}
                isFrom={isFromPrice}
              />
              <Discount slug product={product} discount={discount} />
            </div>

            {isInCampaign && campaign && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  Campaign Deal — Only {campaign.campaignRemainingStock} left!
                </div>
              </div>
            )}

            {requiresVariant ? (
              // Variant products can't be picked/added from the quick-view
              // modal — send the user to the product page to choose options.
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch">
                <Link
                  href={`/product/${product.slug}`}
                  onClick={() => setModalOpen(false)}
                  className="inline-flex h-11 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:min-w-[9.5rem]"
                >
                  <FiEye className="mr-2 shrink-0" />
                  Choose Options
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch">
                <div className="flex w-full items-center justify-between overflow-hidden rounded-lg border border-border sm:w-auto sm:min-w-[7.5rem]">
                  <button
                    type="button"
                    onClick={() => setItem(item - 1)}
                    disabled={item === 1}
                    className="flex h-11 w-10 shrink-0 items-center justify-center border-r border-border text-foreground transition-colors hover:text-muted-foreground disabled:opacity-50"
                  >
                    <FiMinus />
                  </button>
                  <p className="min-w-[2.5rem] text-center text-sm font-semibold">
                    {item}
                  </p>
                  <button
                    type="button"
                    onClick={() => setItem(item + 1)}
                    disabled={!stock || item >= stock}
                    className="flex h-11 w-10 shrink-0 items-center justify-center border-l border-border text-foreground transition-colors hover:text-muted-foreground disabled:opacity-50"
                  >
                    <FiPlus />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddToCart(item)}
                  disabled={!stock || stock < 1}
                  className="inline-flex h-11 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[9.5rem]"
                >
                  <FiShoppingBag className="mr-2 shrink-0" />
                  Add to cart
                </button>

                <Link
                  href={`/product/${product.slug}`}
                  onClick={() => setModalOpen(false)}
                  className="inline-flex h-11 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-primary sm:min-w-[9.5rem]"
                >
                  <FiEye className="mr-2 shrink-0" />
                  View details
                </Link>
              </div>
            )}

            <div className="mt-5">
              {category_name ? (
                <p className="text-sm">
                  <span className="font-semibold text-muted-foreground">
                    Category
                  </span>{" "}
                  <Link
                    href={`/search?category=${category_name}&_id=${product?.category?._id}`}
                    onClick={() => setModalOpen(false)}
                    className="font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {category_name}
                  </Link>
                </p>
              ) : null}
              <Tags product={product} />
            </div>

            {globalSetting?.contact && (
              <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-border pt-4 text-sm text-muted-foreground">
                <FiHeadphones className="shrink-0" />
                <span>Call Us for Order</span>
                <a href={`tel:${globalSetting.contact}`} className="font-semibold text-primary">
                  {globalSetting.contact}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainModal>
  );
};

export default ProductModal;
