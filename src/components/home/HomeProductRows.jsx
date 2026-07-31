import { searchProducts } from "@lib/actions/product.actions";
import ProductRowSection from "./ProductRowSection";

/**
 * Best Sellers — ranked by review count (Laravel has no orders_count sort;
 * reviews_count is the closest real popularity signal, same mapping
 * searchProducts already uses for sort=best-selling).
 */
export const BestSellersRow = async ({ attributes }) => {
  const { products } = await searchProducts({ sort: "best-selling", limit: 15 });
  return (
    <ProductRowSection
      title="Best Sellers"
      viewMoreHref="/search?sort=best-selling"
      products={products}
      attributes={attributes}
    />
  );
};

/** New Arrivals — most recently added products. */
export const NewArrivalsRow = async ({ attributes }) => {
  const { products } = await searchProducts({ sort: "newest", limit: 15 });
  return (
    <ProductRowSection
      title="New Arrivals"
      viewMoreHref="/search?sort=newest"
      products={products}
      attributes={attributes}
      tint
    />
  );
};

/**
 * Flash Sale spotlight — the red-background section. The Laravel API has
 * no campaign module (`/campaign/all` 404s), so rather than show a fake
 * "campaign" this uses the same real on-sale products the hero/offer card
 * already pull from, just styled as a bold red banner section.
 */
export const FlashSaleRow = async ({ attributes }) => {
  const { products } = await searchProducts({ onSale: true, limit: 15, sort: "newest" });
  return (
    <ProductRowSection
      title="🔥 Flash Sale"
      subtitle="Deep discounts, while stocks last"
      viewMoreHref="/search?on_sale=1"
      products={products}
      attributes={attributes}
      red
    />
  );
};

/** Category spotlight row — e.g. "Top Deals in Liquor". */
export const CategoryDealsRow = async ({ title, categorySlug, attributes, tint }) => {
  const { products } = await searchProducts({
    category: categorySlug,
    sort: "newest",
    limit: 15,
  });
  return (
    <ProductRowSection
      title={title}
      viewMoreHref={`/search?category=${categorySlug}`}
      products={products}
      attributes={attributes}
      tint={tint}
    />
  );
};
