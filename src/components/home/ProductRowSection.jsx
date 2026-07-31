import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import ProductCard from "@components/product/ProductCard";

/**
 * Takealot-style horizontal product row: left-aligned heading, a "View
 * More" link pinned top-right (not centered/bottom like the grid sections
 * above), and a single scrollable row of cards instead of a wrapping grid.
 */
const ProductRowSection = ({ title, viewMoreHref, products, attributes, tint, red, subtitle }) => {
  if (!products?.length) return null;

  const bgClass = red
    ? "bg-gradient-to-br from-red-700 to-red-900"
    : tint
      ? "bg-muted/50 dark:bg-muted/30"
      : "bg-background";

  return (
    <div className={`${bgClass} py-10 lg:py-12`}>
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className={`text-lg lg:text-xl font-semibold ${red ? "text-white" : "text-foreground"}`}>
              {title}
            </h2>
            {subtitle && (
              <p className={`mt-0.5 text-sm ${red ? "text-white/80" : "text-muted-foreground"}`}>
                {subtitle}
              </p>
            )}
          </div>
          {viewMoreHref && (
            <Link
              href={viewMoreHref}
              className={`flex shrink-0 items-center gap-1 text-sm font-semibold hover:underline ${
                red ? "text-white" : "text-primary"
              }`}
            >
              View More
              <FiChevronRight size={14} />
            </Link>
          )}
        </div>

        <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-2 sm:gap-3 [scrollbar-width:thin]">
          {products.map((product) => (
            <div key={product._id} className="w-[170px] shrink-0 sm:w-[200px]">
              <ProductCard product={product} attributes={attributes} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductRowSection;
