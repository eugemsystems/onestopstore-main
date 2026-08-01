import ProductLink from "@components/common/ProductLink";
import ImageWithFallback from "@components/common/ImageWithFallBack";

const formatMoney = (n) => {
  const num = Number(n) || 0;
  return `$${num.toFixed(2)}`;
};

/**
 * A single compact list row (thumbnail + name + price + discount badge) —
 * the original "Latest Offers" row style, used for the two rows below the
 * card grid in OfferCard.
 */
const OfferProductRow = ({ product }) => {
  const price = product?.prices || {};

  return (
    <ProductLink
      href={`/product/${product?.slug}`}
      className="group flex items-center gap-3 rounded-lg border border-border bg-background p-2 transition-colors hover:border-primary/50"
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-border">
        <ImageWithFallback
          fill
          fit="contain"
          sizes="48px"
          alt="product"
          className="p-1"
          src={product?.image?.[0]}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium text-foreground group-hover:text-primary">
          {product?.title}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="text-sm font-bold text-primary">
            {formatMoney(price.price)}
          </span>
          {price.discount > 0 && (
            <>
              <span className="text-xs text-muted-foreground line-through">
                {formatMoney(price.originalPrice)}
              </span>
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                -{price.discount}%
              </span>
            </>
          )}
        </div>
      </div>
    </ProductLink>
  );
};

export default OfferProductRow;
