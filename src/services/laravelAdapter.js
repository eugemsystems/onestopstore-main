/**
 * Laravel API adapter
 * ---------------------------------------------------------------
 * The storefront UI expects KachaBazar-shaped documents (Mongo-style
 * `_id`, i18n `title` objects, nested `prices`). Our backend is the
 * Raines Laravel API (numeric ids, flat `name`/`price` fields).
 * These transformers convert Laravel responses into the shapes the
 * UI already consumes, so components stay untouched.
 */

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

// Laravel's APP_URL emits plain `http://` links for its own host (media
// proxy, storage) even though the app is only reachable over `https://`
// behind the Traefik/Nginx front door (self-signed cert locally, real cert
// in production) — a plain-http request 404s. Force the scheme to https
// for our own known API/media hosts; leave third-party URLs (Takealot CDN,
// etc.) untouched.
const HTTPS_ONLY_HOSTS = [
  "api.shop.local",
  "media.shop.local",
  "api.onestopstore.co.zw",
  "media.onestopstore.co.zw",
];

export function upgradeMediaUrl(url) {
  if (!url) return url;
  for (const host of HTTPS_ONLY_HOSTS) {
    if (url.startsWith(`http://${host}`)) {
      return `https://${url.slice(7)}`;
    }
  }
  return url;
}

/**
 * Mirrors the legacy frontend's isSaleActive() exactly: a sale price alone
 * isn't enough — `is_sale_enable` must be on AND, if a start/end window is
 * set, "now" must fall inside it. Variations (no `is_sale_enable` field)
 * are treated as always-active once they carry a valid sale_price.
 */
export function isSaleActive(p) {
  if (!p) return false;
  const hasSale = p?.sale_price != null && Number(p.sale_price) > 0;
  if (!hasSale) return false;

  const salePrice = Number(p.sale_price);
  const regularPrice = Number(p.price || 0);
  if (salePrice >= regularPrice) return false;

  if (p?.is_sale_enable === undefined || p?.is_sale_enable === null) {
    return true;
  }

  const enabled = Number(p?.is_sale_enable) === 1;
  if (!enabled) return false;

  const now = new Date();
  const hasStartDate = p?.sale_starts_at && String(p.sale_starts_at).trim() !== "";
  const hasEndDate = p?.sale_expired_at && String(p.sale_expired_at).trim() !== "";

  if (!hasStartDate && !hasEndDate) return true;
  if (hasStartDate && now < new Date(p.sale_starts_at)) return false;
  if (hasEndDate && now > new Date(p.sale_expired_at)) return false;

  return true;
}

/** Laravel product -> template product */
export function toTemplateProduct(p) {
  if (!p) return null;

  const price = num(p.price);
  const salePrice = p.sale_price != null ? num(p.sale_price) : null;
  const onSale = isSaleActive(p);
  const finalPrice = onSale ? salePrice : price;
  const discountPct = onSale ? Math.round(((price - salePrice) / price) * 100) : 0;

  const thumb = upgradeMediaUrl(
    p.product_thumbnail?.image_url ||
      p.product_thumbnail?.original_url ||
      p.product_thumbnail?.takealot_url ||
      null,
  );

  const galleries = Array.isArray(p.product_galleries)
    ? p.product_galleries
        .map((g) => upgradeMediaUrl(g?.image_url || g?.original_url || g?.takealot_url))
        .filter(Boolean)
    : [];

  const images = [thumb, ...galleries].filter(Boolean);

  const categories = Array.isArray(p.categories)
    ? p.categories.map((c) => ({
        _id: String(c.id),
        id: c.id,
        name: { en: c.name },
        slug: c.slug,
      }))
    : [];

  const brand = p.brand
    ? {
        _id: String(p.brand.id ?? p.brand_id ?? ""),
        id: p.brand.id ?? p.brand_id,
        name: p.brand.name || "",
        slug: p.brand.slug || "",
      }
    : null;

  // Variations (classified/combination products) — e.g. "Bench Capper" has
  // a Colour attribute with Red/Yellow variations. `attributeValueIds` is
  // what the variant-selection UI (useProductAction + VariantList) matches
  // a user's picks against to resolve the exact variation.
  const variants = Array.isArray(p.variations)
    ? p.variations.map((v) => ({
        _id: String(v.id),
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: num(v.sale_price > 0 && v.sale_price < v.price ? v.sale_price : v.price),
        originalPrice: num(v.price),
        stock: v.stock_status === "in_stock" ? Number(v.quantity) || 0 : 0,
        stockStatus: v.stock_status,
        attributes: v.attribute_values || v.attributes || [],
        attributeValueIds: (v.attribute_values || []).map((av) => av.id),
        laybyEligibility: v.layby_eligibility || null,
        stockQuantity: Number(v.quantity) || 0,
        image: upgradeMediaUrl(
          v.variation_image?.image_url ||
            v.variation_image?.original_url ||
            v.variation_image?.takealot_url ||
            null,
        ),
      }))
    : [];

  // Attribute definitions scoped to THIS product (e.g. Colour: Red, Yellow),
  // built directly from each variation's nested attribute_values so this
  // works on BOTH the single-product detail endpoint AND the list/search
  // endpoint — the search endpoint never returns a top-level `p.attributes`,
  // only variations with attribute_values (id, value, hex_color, attribute_id,
  // but no attribute name). When `p.attributes` IS present (detail endpoint)
  // it's used only to resolve the real attribute name (e.g. "Colour").
  const valueImageById = {};
  (p.variations || []).forEach((v) => {
    const img = upgradeMediaUrl(
      v.variation_image?.image_url || v.variation_image?.original_url || null,
    );
    if (!img) return;
    (v.attribute_values || []).forEach((av) => {
      if (!valueImageById[av.id]) valueImageById[av.id] = img;
    });
  });
  const attributeNameById = {};
  if (Array.isArray(p.attributes)) {
    p.attributes.forEach((attr) => {
      attributeNameById[attr.id] = attr.name;
    });
  }
  const groupedValues = new Map();
  (p.variations || []).forEach((v) => {
    (v.attribute_values || []).forEach((av) => {
      if (!groupedValues.has(av.attribute_id)) groupedValues.set(av.attribute_id, new Map());
      const values = groupedValues.get(av.attribute_id);
      if (!values.has(av.id)) {
        values.set(av.id, {
          id: av.id,
          value: av.value,
          hexColor: av.hex_color || null,
          slug: av.slug,
          image: valueImageById[av.id] || null,
        });
      }
    });
  });
  const attributeIds = Array.from(groupedValues.keys());
  const variantAttributes = attributeIds
    .map((attributeId, idx) => ({
      id: attributeId,
      name:
        attributeNameById[attributeId] ||
        (attributeIds.length > 1 ? `Option ${idx + 1}` : "Options"),
      values: Array.from(groupedValues.get(attributeId).values()),
    }))
    .filter((attr) => attr.values.length > 0);

  return {
    _id: String(p.id),
    id: p.id,
    sku: p.sku || "",
    slug: p.slug,
    title: { en: p.name },
    description: { en: p.short_description || "" },
    // Full HTML product description (Laravel's `description` field) — the
    // short one above is a plain-text teaser only; this is what the
    // Description tab renders via dangerouslySetInnerHTML.
    descriptionHtml: p.description || "",
    image: images,
    imageCount: galleries.length,
    stock:
      p.stock_status === "in_stock"
        ? (Number(p.quantity) > 0 ? Number(p.quantity) : 100)
        : 0,
    sales: Number(p.orders_count) || 0,
    tag: Array.isArray(p.tags) ? p.tags.map((t) => t?.name).filter(Boolean) : [],
    prices: {
      price: finalPrice,
      originalPrice: price,
      discount: discountPct,
    },
    categories,
    category: categories[0] || null,
    brand,
    isCombination: variants.length > 0,
    variants,
    variantAttributes,
    status: p.status === 0 ? "hide" : "show",

    // Top-level fields several shared components (Rating, etc.) read directly.
    // The single-product detail endpoint doesn't return `reviews_avg_rating`
    // at all (only the list/search endpoint does) — it uses `rating_count`
    // for the same value instead, so fall back to that (mirrors the legacy
    // frontend's `reviews_avg_rating ?? rating_count` chain).
    average_rating: num(p.reviews_avg_rating ?? p.rating_count),
    total_reviews: Number(p.reviews_count) || 0,

    // Extra Raines fields the UI can progressively adopt
    raines: {
      estimatedDeliveryText: p.estimated_delivery_text || null,
      reviewsAvgRating: num(p.reviews_avg_rating ?? p.rating_count),
      reviewsCount: Number(p.reviews_count) || 0,
      isFeatured: !!p.is_featured,
      isTrending: !!p.is_trending,
      stockStatus: p.stock_status,
      brandId: p.brand_id ?? null,
      zambiaOnly: !!p.zambia_only,
      zimbabweOnly: !!p.zimbabwe_only,
      saOnly: !!p.sa_only,
      currencyCode: p.original_currency_code || "USD",
      laybyEligible: !!p.layby_eligibility?.eligible,
      laybyDepositPercentage: p.layby_eligibility?.deposit_percentage ?? null,
      // Full eligibility payload (deposit %, available durations, sale flag,
      // spend threshold) — drives the on-page layby banner + apply modal.
      laybyEligibility: p.layby_eligibility || null,
      // Sale window — powers the countdown timer + "on sale" badge/eligibility,
      // computed with the same rules as isSaleActive() above.
      isOnSale: onSale,
      isSaleEnabled: p?.is_sale_enable != null ? Number(p.is_sale_enable) === 1 : null,
      saleStartsAt: p.sale_starts_at || null,
      saleExpiredAt: p.sale_expired_at || null,
      // Only the single-product detail endpoint returns `warranty` — the
      // list/search endpoint omits it entirely — but that's the only place
      // these cards are shown, so no extra fetch is needed.
      warranty: p.warranty || null,
      returnPolicyText: p.return_policy_text || null,
      // Raw HTML specification table — detail endpoint only.
      specifications: p.specifications || null,
      // Star-rating breakdown, index 0 = 1-star count .. index 4 = 5-star
      // count (verified against the live API's `review_ratings` field).
      reviewRatings: Array.isArray(p.review_ratings) ? p.review_ratings : [0, 0, 0, 0, 0],
      // Gift-card products can't be mixed with ordinary products in the same
      // cart/order (legacy frontend enforces the same rule at checkout).
      isGiftCard:
        !!p.is_gift_card || /gift\s*(voucher|card)/i.test(p.name || ""),
    },
  };
}

/** Laravel category (with nested subcategories) -> template category */
export function toTemplateCategory(c) {
  if (!c) return null;
  return {
    _id: String(c.id),
    id: c.id,
    name: { en: c.name },
    slug: c.slug,
    description: { en: c.description || "" },
    parentId: c.parent_id != null ? String(c.parent_id) : null,
    icon: upgradeMediaUrl(
      c.category_icon?.image_url ||
        c.category_image?.image_url ||
        c.category_icon?.original_url ||
        null,
    ),
    status: c.status === 0 ? "hide" : "show",
    children: Array.isArray(c.subcategories)
      ? c.subcategories.map(toTemplateCategory).filter(Boolean)
      : [],
  };
}

/** Unwrap Laravel pagination ({data:[...]}) or plain arrays */
export function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

/** Split a product list into the home-page buckets the UI expects */
export function bucketProducts(laravelProducts) {
  const products = laravelProducts.map(toTemplateProduct).filter(Boolean);

  const popularProducts = products.filter(
    (p) => p.raines.isFeatured || p.raines.isTrending,
  );
  const discountedProducts = products.filter((p) => p.prices.discount > 0);

  return {
    products,
    popularProducts: popularProducts.length > 0 ? popularProducts : products.slice(0, 18),
    discountedProducts,
  };
}
