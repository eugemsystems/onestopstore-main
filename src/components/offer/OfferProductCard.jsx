import ProductLink from "@components/common/ProductLink";
import ImageWithFallback from "@components/common/ImageWithFallBack";

const formatMoney = (n) => {
  const num = Number(n) || 0;
  return `$${num.toFixed(2)}`;
};

/**
 * Compact product card for the "Latest Offers" slider — deliberately NOT
 * DiscountedCard (that one's built for wide 5-6-column grids: fixed h-48/52
 * image, absolutely-positioned wishlist/cart buttons, hover-reveal quick
 * view). Squeezing two of those into this narrow column produced oversized,
 * overflowing cards with an uneven bottom. This is a simple, self-contained
 * thumbnail + name + price card sized to actually fit two per row cleanly.
 */
const OfferProductCard = ({ product }) => {
  const price = product?.prices || {};

  return (
    <ProductLink
      href={`/product/${product?.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50"
    >
      <div className="relative w-full flex-1 min-h-0 bg-white">
        <ImageWithFallback
          fill
          fit="contain"
          sizes="200px"
          alt="product"
          className="p-3"
          src={product?.image?.[0]}
        />
        {price.discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            -{price.discount}%
          </span>
        )}
      </div>
      <div className="shrink-0 px-2.5 py-2">
        <p className="mb-1 line-clamp-1 text-xs font-medium text-foreground group-hover:text-primary">
          {product?.title}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-primary">
            {formatMoney(price.price)}
          </span>
          {price.discount > 0 && (
            <span className="text-[11px] text-muted-foreground line-through">
              {formatMoney(price.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </ProductLink>
  );
};

export default OfferProductCard;
