/**
 * For a product with variations, cards should show "From <lowest price>"
 * rather than whatever the first variant happens to be — mirrors the
 * legacy frontend's getMinVariationPrice()/getDisplayPrice() behavior.
 */
export const getFromPrice = (product) => {
  // Delivery options win: show the cheapest (in-stock) option as "From"
  const options = product?.deliveryOptions;
  if (Array.isArray(options) && options.length > 0) {
    const inStock = options.filter((o) => Number(o?.stock) > 0);
    const pool = inStock.length ? inStock : options;
    const cheapest = pool.reduce((min, o) => (Number(o.price) < Number(min.price) ? o : min), pool[0]);
    return { price: cheapest.price, originalPrice: cheapest.originalPrice, isFrom: true };
  }

  const variants = product?.variants;
  if (!Array.isArray(variants) || variants.length === 0) {
    return {
      price: product?.prices?.price,
      originalPrice: product?.prices?.originalPrice,
      isFrom: false,
    };
  }

  const cheapest = variants.reduce((min, v) => {
    const price = Number(v?.price);
    if (!Number.isFinite(price) || price <= 0) return min;
    if (!min || price < Number(min.price)) return v;
    return min;
  }, null);

  if (!cheapest) {
    return {
      price: product?.prices?.price,
      originalPrice: product?.prices?.originalPrice,
      isFrom: false,
    };
  }

  return {
    price: cheapest.price,
    originalPrice: cheapest.originalPrice,
    isFrom: true,
  };
};
