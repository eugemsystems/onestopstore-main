"use client";

import { useState, useEffect, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SidebarContext } from "@context/SidebarContext";
import useAddToCart from "@hooks/useAddToCart";
import { notifyError } from "@utils/toast";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { getFromPrice } from "@utils/getFromPrice";

export default function useProductAction({
  product,
  globalSetting,
  campaignInfo = null, // { campaignPrice, campaignOriginalPrice, campaignRemainingStock, campaignId, ... }
  onCloseModal, // optional for modal flow
  withRouter = false, // if true, enable handleMoreInfo
}) {
  const router = useRouter();
  const { setIsLoading, isLoading } = useContext(SidebarContext) || {};
  const { handleAddItem } = useAddToCart();
  const { getNumber, showingTranslateValue } = useUtilsFunction();

  const [item, setItem] = useState(1); // quantity
  const [isReadMore, setIsReadMore] = useState(false);
  // { [attributeId]: valueId } — one entry per attribute the user has picked
  const [selectedValues, setSelectedValues] = useState({});
  // User's explicit gallery-thumbnail click — takes priority over the
  // variant's own image until the variant selection changes again.
  const [manualImage, setManualImage] = useState(null);

  const currency = globalSetting?.default_currency || "$";

  // Resolve campaign data from either the prop or embedded product.campaign
  const campaign = campaignInfo || product?.campaign || null;
  const isInCampaign = !!(campaign && campaign.inCampaign !== false);

  const variantAttributes = product?.variantAttributes || [];
  const requiresVariant = variantAttributes.length > 0;

  // Reset the picker whenever the product changes (card grid, modal reopen, etc.)
  useEffect(() => {
    setSelectedValues({});
    setManualImage(null);
    setItem(1);
  }, [product?._id]);

  const isVariantComplete =
    !requiresVariant ||
    variantAttributes.every((attr) => selectedValues[attr.id] != null);

  // The exact variation matching every attribute the user has picked so far
  const matchedVariant = useMemo(() => {
    if (!requiresVariant) return null;
    if (!isVariantComplete) return null;
    return (
      product?.variants?.find((v) =>
        variantAttributes.every((attr) =>
          v.attributeValueIds?.includes(selectedValues[attr.id]),
        ),
      ) || null
    );
  }, [requiresVariant, isVariantComplete, product?.variants, variantAttributes, selectedValues]);

  const selectVariantValue = (attributeId, valueId) => {
    setSelectedValues((prev) => ({ ...prev, [attributeId]: valueId }));
    setManualImage(null); // let the newly-selected variant's own image win
  };

  // Before a variant is fully selected, show the cheapest variant's price
  // as a "From $X" teaser (matches the legacy detail page) instead of $0 —
  // stock/add-to-cart still stay gated on `matchedVariant` below, this only
  // affects what price is displayed.
  const cheapestVariant = requiresVariant ? getFromPrice(product) : null;
  const isFromPrice = requiresVariant && !matchedVariant && !!cheapestVariant?.isFrom;

  // Price/stock/image derived from: the matched variant (if one is fully
  // selected) → the cheapest variant (teaser) → the campaign → the base
  // product. Stock never falls back while a variant selection is required
  // but incomplete — that's what let "add to cart" through without a
  // variant picked.
  const basePrice = requiresVariant
    ? (matchedVariant?.price ?? cheapestVariant?.price)
    : getNumber(product?.prices?.price);
  const baseOriginalPrice = requiresVariant
    ? (matchedVariant?.originalPrice ?? cheapestVariant?.originalPrice)
    : getNumber(product?.prices?.originalPrice);
  const baseStock = requiresVariant ? matchedVariant?.stock ?? 0 : product?.stock;
  const baseImage = requiresVariant
    ? matchedVariant?.image || product?.image?.[0]
    : product?.image?.[0];

  let price = basePrice;
  let originalPrice = baseOriginalPrice;
  let stock = baseStock;
  let discount = 0;
  let selectedImage = manualImage || baseImage;

  if (isInCampaign) {
    price = getNumber(campaign.campaignPrice);
    originalPrice = getNumber(campaign.campaignOriginalPrice || baseOriginalPrice);
    stock = Math.min(baseStock || 0, campaign.campaignRemainingStock ?? Infinity);
  }
  if (originalPrice > 0 && price != null) {
    discount = getNumber(((originalPrice - price) / originalPrice) * 100);
  }

  // Add to cart
  const handleAddToCart = (quantityArg) => {
    const quantity = typeof quantityArg === "number" ? quantityArg : item;

    if (requiresVariant && !isVariantComplete) {
      return notifyError("Please select all options first!");
    }
    if (requiresVariant && !matchedVariant) {
      return notifyError("This combination is not available.");
    }
    if (!stock || stock < quantity) {
      return notifyError("Insufficient stock");
    }

    const selectedValueNames = variantAttributes
      .map((attr) => attr.values.find((v) => v.id === selectedValues[attr.id])?.value)
      .filter(Boolean);

    const {
      variants,
      variantAttributes: _va,
      categories,
      description,
      campaign: _camp,
      ...updatedProduct
    } = product;

    const newItem = {
      ...updatedProduct,
      id: matchedVariant ? `${product._id}-${matchedVariant.id}` : product._id,
      title: matchedVariant
        ? `${showingTranslateValue(product.title)} - ${selectedValueNames.join(", ")}`
        : showingTranslateValue(product.title),
      image: selectedImage,
      variant: matchedVariant || null,
      price: getNumber(price),
      originalPrice: getNumber(originalPrice),
      ...(isInCampaign
        ? {
            campaignId: campaign.campaignId,
            campaignPrice: campaign.campaignPrice,
            inCampaign: true,
            campaignRemainingStock: campaign.campaignRemainingStock,
          }
        : {}),
    };

    handleAddItem(newItem, quantity);
  };

  // Optional for modal/product detail routing
  const handleMoreInfo = (slug) => {
    if (!withRouter) return;
    if (onCloseModal) onCloseModal();
    router.push(`/product/${slug}`);
    setIsLoading?.(!isLoading);
  };

  // Display name for the category (human-readable)
  const category_display_name =
    showingTranslateValue(product?.category?.name) || "";

  // URL-safe slug for category links
  const category_name = category_display_name
    ?.toLowerCase()
    ?.replace(/[^A-Z0-9]+/gi, "-");

  return {
    // quantity
    item,
    setItem,

    // variant selection
    variantAttributes,
    requiresVariant,
    selectedValues,
    selectVariantValue,
    isVariantComplete,
    matchedVariant,

    // derived pricing/stock
    price,
    stock,
    discount,
    originalPrice,
    isFromPrice,
    selectedImage,
    setSelectedImage: setManualImage,

    isReadMore,
    setIsReadMore,
    currency,
    category_name,
    category_display_name,

    // campaign state
    isInCampaign,
    campaign,

    // actions
    handleAddToCart,
    handleMoreInfo,
  };
}
