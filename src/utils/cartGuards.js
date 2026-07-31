/**
 * Gift-card products can't share a cart/order with ordinary products —
 * mirrors the legacy frontend's checkout-time gift-card gate, enforced
 * earlier (at add-to-cart) so the user finds out before checkout.
 */
export const isGiftCardItem = (item) =>
  !!(item?.raines?.isGiftCard ?? item?.is_gift_card);

export const canAddToCart = (existingItems, candidate) => {
  if (!existingItems?.length) return { ok: true };

  const addingGiftCard = isGiftCardItem(candidate);
  const cartHasGiftCard = existingItems.some(isGiftCardItem);
  const cartHasRegular = existingItems.some((i) => !isGiftCardItem(i));

  if (addingGiftCard && cartHasRegular) {
    return {
      ok: false,
      message:
        "Gift cards can't be ordered together with other products. Please checkout your cart first, or remove the other items.",
    };
  }
  if (!addingGiftCard && cartHasGiftCard) {
    return {
      ok: false,
      message:
        "Your cart contains a gift card, which can't be combined with other products. Please checkout or clear your cart first.",
    };
  }
  return { ok: true };
};
