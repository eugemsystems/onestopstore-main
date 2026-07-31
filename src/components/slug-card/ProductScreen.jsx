"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FacebookShareButton, TwitterShareButton } from "react-share";
import { ArrowDown, ArrowUp, ChevronRight, Minus, Plus } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

//internal import

import Price from "@components/common/Price";
import Stock from "@components/common/Stock";
import Tags from "@components/common/Tags";
import ProductHighlights from "@components/slug-card/ProductHighlights";
import Discount from "@components/common/Discount";
import ProductCard from "@components/product/ProductCard";
import VariantList from "@components/variants/VariantList";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ImageCarousel from "@components/carousel/ImageCarousel";
import { useSetting } from "@context/SettingContext";
import useProductAction from "@hooks/useProductAction";
import Rating from "@components/common/Rating";
import { Button } from "@components/ui/button";
import ProductReviews from "./ProductReviews";
import ProductInfoTab from "./ProductInfoTab";
import ProductQnA from "./ProductQnA";
import {
  FiChevronRight,
  FiHeadphones,
  FiMinus,
  FiPlus,
  FiFileText,
  FiList,
  FiStar,
  FiMessageCircle,
} from "react-icons/fi";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment } from "react";

import CampaignCountdown from "@components/campaign/CampaignCountdown";
import SaleCountdown from "@components/product/SaleCountdown";
import LaybyBanner from "@components/product/LaybyBanner";
import WarrantyReturnCards from "@components/product/WarrantyReturnCards";

const ProductScreen = ({ product, reviews, relatedProducts }) => {
  const router = useRouter();
  const { globalSetting, storeCustomization } = useSetting();
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
    setSelectedImage,
    variantAttributes,
    requiresVariant,
    selectedValues,
    selectVariantValue,
    isVariantComplete,
    matchedVariant,
    category_name,
    category_display_name,
    // campaign state
    isInCampaign,
    campaign,
    // actions
    handleAddToCart,
  } = useProductAction({
    product,
    globalSetting,
  });

  // console.log("discount", discount);

  return (
    <>
      <div className="bg-background px-0">
        <div className="container mx-auto px-3 sm:px-10 max-w-screen-2xl">
          <div className="flex items-center py-4 lg:py-6">
            <ol className="flex items-center w-full overflow-hidden text-muted-foreground">
              <li className="text-sm pr-1 transition duration-200 ease-in cursor-pointer hover:text-primary font-semibold">
                <Link href="/">Home</Link>
              </li>
              <li className="text-sm mt-[1px]">
                {" "}
                <FiChevronRight />{" "}
              </li>
              <li className="text-sm pl-1 transition duration-200 ease-in cursor-pointer hover:text-primary font-semibold ">
                <Link
                  href={`/search?category=${category_name}&_id=${product?.category?._id}`}
                >
                  <button
                    type="button"
                    onClick={() => setIsLoading(!isLoading)}
                  >
                    {category_display_name}
                  </button>
                </Link>
              </li>
              <li className="text-sm mt-[1px]">
                {" "}
                <FiChevronRight />{" "}
              </li>
              <li className="text-sm px-1 transition duration-200 ease-in ">
                {showingTranslateValue(product?.title)}
              </li>
            </ol>
          </div>
          {/* Product */}
          <div className="relative lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-8 lg:gap-y-8 mb-16">
            {/* Product image */}
            <div className="lg:col-span-3 lg:row-end-1">
              {/* Image gallery card */}
              <div className="rounded-2xl border border-border bg-card p-3 sm:p-4">
                <div className="overflow-hidden w-full mx-auto">
                  <div className="relative aspect-square w-full rounded-xl bg-muted overflow-hidden">
                    <Image
                      src={
                        selectedImage ||
                        product?.image?.[0] ||
                        "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                      }
                      alt="product"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 500px"
                      className="object-cover"
                    />
                  </div>
                </div>

                {product?.image?.length > 1 && (
                  <div className="flex flex-row flex-wrap mt-2">
                    <ImageCarousel
                      images={product.image}
                      activeImage={selectedImage || product?.image?.[0]}
                      handleChangeImage={setSelectedImage}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Product details */}
            <div className="lg:sticky top-44 mt-6 lg:mt-0 self-start z-10 mx-auto lg:col-span-4 lg:row-span-2 lg:row-end-2 lg:max-w-none">
              {/* Campaign Banner */}
              {isInCampaign && campaign && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">
                        Campaign Deal
                      </span>
                      <span className="text-xs text-red-500 dark:text-red-300">
                        — Only {campaign.campaignRemainingStock} left at this
                        price!
                      </span>
                    </div>
                    <CampaignCountdown
                      endTime={campaign.campaignEndTime}
                      startTime={campaign.campaignStartTime}
                    />
                  </div>
                </div>
              )}

              <div className="mb-2 md:mb-2.5 block -mt-1.5">
                <div className="relative">
                  <Stock stock={stock} />
                </div>
                <h1 className="leading-7 text-lg md:text-xl lg:text-2xl mb-1 font-semibold  text-foreground">
                  {showingTranslateValue(product?.title)}
                </h1>
                <div className="flex gap-0.5 items-center mt-1">
                  <Rating
                    size="md"
                    showReviews={true}
                    rating={product?.average_rating}
                    totalReviews={product?.total_reviews}
                  />
                </div>
              </div>
              <div className="flex items-center mb-8">
                <Price
                  price={price}
                  product={product}
                  originalPrice={originalPrice}
                  campaign={isInCampaign ? campaign : null}
                  isFrom={isFromPrice}
                />
                <span className="ml-2 block">
                  <Discount slug product={product} discount={discount} />
                </span>
              </div>

              {product?.raines?.isOnSale && product?.raines?.saleExpiredAt && (
                <SaleCountdown endDate={product.raines.saleExpiredAt} />
              )}

              {requiresVariant && (
                <div className="mb-6">
                  {variantAttributes.map((attribute) => (
                    <div key={attribute.id} className="mb-4">
                      <h4 className="text-sm py-1 text-foreground font-medium">
                        {attribute.name}:{" "}
                        {selectedValues[attribute.id] == null && (
                          <span className="text-xs font-normal text-red-500">
                            please select
                          </span>
                        )}
                      </h4>
                      <VariantList
                        attribute={attribute}
                        selectedValues={selectedValues}
                        onSelect={selectVariantValue}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mt-4">
                  {/* Quantity Selector */}
                  <div className="group flex shrink-0 items-center justify-between rounded-md overflow-hidden border h-11 border-border">
                    <Button
                      variant="outline"
                      onClick={() => setItem(item - 1)}
                      disabled={item === 1}
                      className="border-0 border-e-1 border-border rounded-none flex items-center justify-center h-full flex-shrink-0 transition ease-in-out duration-300 focus:outline-none w-9 md:w-12 text-foreground hover:text-muted-foreground"
                    >
                      <span className="sm:text-2xl">
                        <Minus />
                      </span>
                    </Button>

                    <p className="font-semibold flex items-center justify-center transition-colors duration-250 ease-in-out cursor-default flex-shrink-0 text-base text-foreground w-8 md:w-16">
                      {item}
                    </p>

                    <Button
                      variant="outline"
                      onClick={() => setItem(item + 1)}
                      disabled={!stock || item >= stock}
                      className="border-0 border-s-1 border-border rounded-none flex items-center justify-center h-full flex-shrink-0 transition ease-in-out duration-300 focus:outline-none w-9 md:w-12 text-foreground hover:text-muted-foreground"
                    >
                      <span className="sm:text-2xl">
                        <Plus />
                      </span>
                    </Button>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={() => handleAddToCart(item)}
                    disabled={
                      !stock || stock < 1 || (requiresVariant && !isVariantComplete)
                    }
                    className="text-sm leading-4 inline-flex flex-1 min-w-0 items-center cursor-pointer transition ease-in-out duration-300 font-semibold text-center justify-center border-0 border-transparent rounded-md focus-visible:outline-none focus:outline-none px-3 sm:px-4 md:px-6 h-11 disabled:cursor-not-allowed disabled:opacity-60"
                    variant="create"
                  >
                    {requiresVariant && !isVariantComplete
                      ? "Select Options"
                      : "Add to Cart"}
                  </Button>

                  {/* WhatsApp enquiry — icon only, label shown on hover */}
                  <div className="group/wa relative shrink-0">
                    <button
                      type="button"
                      aria-label="Enquire on WhatsApp"
                      onClick={() => {
                        const message = `I would like to enquire about *${showingTranslateValue(product?.title)}*\n${typeof window !== "undefined" ? window.location.href : ""}`;
                        sessionStorage.setItem("wa_prefill", message);
                        document.getElementById("wa-chat-fab")?.click();
                      }}
                      className="flex h-11 w-11 items-center justify-center rounded-md border border-[#25D366] text-[#25D366] transition-colors hover:bg-[#25D366]/10"
                    >
                      <FaWhatsapp size={20} />
                    </button>
                    <span className="pointer-events-none absolute right-0 bottom-full z-10 mb-2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover/wa:opacity-100">
                      Enquire on WhatsApp
                    </span>
                  </div>
                </div>

                <div className="flex items-center mt-4">
                  <div className="flex items-center justify-between space-s-3 sm:space-s-4 w-full">
                    <div>
                      <span className=" font-semibold py-1 text-sm d-block">
                        <span className="text-muted-foreground">Category:</span>{" "}
                        <Link
                          href={`/search?category=${category_name}&_id=${product?.category?._id}`}
                          className="cursor-pointer"
                        >
                          <button
                            type="button"
                            className="text-muted-foreground font-medium ml-2 hover:text-primary"
                            onClick={() => setIsLoading(!isLoading)}
                          >
                            {category_display_name}
                          </button>
                        </Link>
                      </span>

                      <Tags product={product} />
                    </div>
                  </div>
                </div>
                {globalSetting?.contact && (
                  <div className="flex items-center text-sm text-muted-foreground mt-3">
                    <FiHeadphones className="mr-1 text-md" />
                    Call Us for Order
                    <a href={`tel:${globalSetting.contact}`} className="font-bold text-primary ml-1">
                      {globalSetting.contact}
                    </a>
                  </div>
                )}

                <div className="mt-6 border-t border-border pt-6">
                  <h3 className="text-sm font-medium text-foreground">
                    Highlights
                  </h3>
                  <div className="mt-4">
                    {/* shipping description card */}
                    <ProductHighlights product={product} />
                  </div>
                  <div className="mt-4">
                    <WarrantyReturnCards product={product} />
                  </div>
                </div>

                <LaybyBanner
                  product={product}
                  matchedVariant={matchedVariant}
                  requiresVariant={requiresVariant}
                  stock={stock}
                  price={price}
                />

                <div className="mt-6 border-t border-border pt-6">
                  <h3 className="text-sm font-medium text-foreground">
                    Share your social network
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    For get lots of traffic from social network share this
                    product
                  </p>
                  <ul role="list" className="mt-4 flex items-center space-x-6">
                    <li>
                      <FacebookShareButton
                        url={`${globalSetting?.meta_url || (typeof window !== "undefined" ? window.location.origin : "")}/product/${product?.slug}`}
                      >
                        <a
                          href="#"
                          className="flex size-6 items-center justify-center text-muted-foreground hover:text-muted-foreground"
                        >
                          <span className="sr-only">Share on Facebook</span>
                          <svg
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                            className="size-5"
                          >
                            <path
                              d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                              clipRule="evenodd"
                              fillRule="evenodd"
                            />
                          </svg>
                        </a>
                      </FacebookShareButton>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="flex size-6 items-center justify-center text-muted-foreground hover:text-muted-foreground"
                      >
                        <span className="sr-only">Share on Instagram</span>
                        <svg
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          className="size-6"
                        >
                          <path
                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                            clipRule="evenodd"
                            fillRule="evenodd"
                          />
                        </svg>
                      </a>
                    </li>
                    <li>
                      <TwitterShareButton
                        url={`${globalSetting?.meta_url || (typeof window !== "undefined" ? window.location.origin : "")}/product/${product?.slug}`}
                      >
                        <a
                          href="#"
                          className="flex size-6 items-center justify-center text-muted-foreground hover:text-muted-foreground"
                        >
                          <span className="sr-only">Share on X</span>
                          <svg
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                            className="size-5"
                          >
                            <path d="M11.4678 8.77491L17.2961 2H15.915L10.8543 7.88256L6.81232 2H2.15039L8.26263 10.8955L2.15039 18H3.53159L8.87581 11.7878L13.1444 18H17.8063L11.4675 8.77491H11.4678ZM9.57608 10.9738L8.95678 10.0881L4.02925 3.03974H6.15068L10.1273 8.72795L10.7466 9.61374L15.9156 17.0075H13.7942L9.57608 10.9742V10.9738Z" />
                          </svg>
                        </a>
                      </TwitterShareButton>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mx-auto w-full lg:col-span-3 lg:my-0 my-8 lg:max-w-none">
              <TabGroup>
                <div className="border-b border-border">
                  <TabList className="-mb-px flex space-x-6 overflow-x-auto">
                    <Tab className="flex cursor-pointer items-center gap-1.5 border-b-2 border-transparent pb-3 text-sm font-medium whitespace-nowrap text-muted-foreground hover:border-border focus:outline-0 hover:text-foreground data-selected:border-primary data-selected:text-primary">
                      <FiFileText size={15} />
                      Description
                    </Tab>
                    <Tab className="flex cursor-pointer items-center gap-1.5 border-b-2 border-transparent pb-3 text-sm font-medium whitespace-nowrap text-muted-foreground hover:border-border focus:outline-0 hover:text-foreground data-selected:border-primary data-selected:text-primary">
                      <FiList size={15} />
                      Product Info
                    </Tab>
                    <Tab className="flex cursor-pointer items-center gap-1.5 border-b-2 border-transparent pb-3 text-sm font-medium whitespace-nowrap text-muted-foreground hover:border-border focus:outline-0 hover:text-foreground data-selected:border-primary data-selected:text-primary">
                      <FiStar size={15} />
                      Reviews
                    </Tab>
                    <Tab className="flex cursor-pointer items-center gap-1.5 border-b-2 border-transparent pb-3 text-sm font-medium whitespace-nowrap text-muted-foreground hover:border-border focus:outline-0 hover:text-foreground data-selected:border-primary data-selected:text-primary">
                      <FiMessageCircle size={15} />
                      Q &amp; A
                    </Tab>
                  </TabList>
                </div>
                <TabPanels as={Fragment}>
                  <TabPanel className="pt-8">
                    <h3 className="sr-only">Product Description</h3>
                    {product?.descriptionHtml ? (
                      <div
                        className="text-sm text-muted-foreground [&_h4]:mt-5 [&_h4]:font-medium [&_h4]:text-foreground [&_li]:pl-2 [&_li::marker]:text-muted-foreground [&_p]:my-2 [&_p]:text-sm/6 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:text-sm/6 [&>:first-child]:mt-0"
                        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                      />
                    ) : (
                      <p className="text-sm leading-6 text-muted-foreground md:leading-6 mb-3">
                        {showingTranslateValue(product?.description)}
                      </p>
                    )}
                  </TabPanel>
                  <TabPanel className="pt-8">
                    <h3 className="sr-only">Product Info</h3>
                    <ProductInfoTab product={product} />
                  </TabPanel>
                  <TabPanel className="pt-8 -mb-10">
                    <h3 className="sr-only">Customer Reviews</h3>
                    <ProductReviews reviews={reviews} product={product} />
                  </TabPanel>
                  <TabPanel className="pt-8">
                    <h3 className="sr-only">Questions &amp; Answers</h3>
                    <ProductQnA product={product} />
                  </TabPanel>
                </TabPanels>
              </TabGroup>
            </div>
          </div>
          {/* related products */}
          {relatedProducts?.length > 0 && (
            <div className="pt-10 lg:pt-12 lg:pb-10 border-t border-border">
              <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl mb-6">
                Related Products
              </h3>
              <div className="flex">
                <div className="w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-3">
                    {relatedProducts?.slice(0, 12).map((product, i) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductScreen;
