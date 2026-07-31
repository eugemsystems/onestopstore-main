"use client";

import Image from "next/image";
import Link from "next/link";
import { FiX, FiRepeat } from "react-icons/fi";
import { useWishlist } from "@context/WishlistContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Rating from "@components/common/Rating";

const CompareTable = ({ products }) => {
  const { removeProductFromCompare } = useWishlist();
  const { formatPrice, showingTranslateValue } = useUtilsFunction();

  if (!products?.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
        <FiRepeat size={40} className="text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Your compare list is empty — tap the compare icon on any product to add it here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <tbody>
          <tr>
            {products.map((product) => (
              <td key={product._id} className="relative w-56 border-b border-border p-4 align-top">
                <button
                  type="button"
                  aria-label="Remove from compare"
                  onClick={() => removeProductFromCompare(product.id)}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-red-100 hover:text-red-600"
                >
                  <FiX size={13} />
                </button>
                <Link href={`/product/${product.slug}`} className="block">
                  <div className="relative mb-3 h-32 w-full bg-white">
                    <Image
                      src={product.image?.[0]}
                      alt="product"
                      fill
                      className="object-contain p-2"
                      sizes="200px"
                    />
                  </div>
                  <h3 className="mb-1 line-clamp-2 text-sm font-medium text-foreground hover:text-primary">
                    {showingTranslateValue(product.title)}
                  </h3>
                </Link>
                <div className="text-base font-bold text-foreground">
                  {formatPrice(product.prices?.price)}
                </div>
              </td>
            ))}
          </tr>
          <tr>
            <td colSpan={products.length} className="border-b border-border bg-muted/40 px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Rating
            </td>
          </tr>
          <tr>
            {products.map((product) => (
              <td key={product._id} className="border-b border-border p-4">
                <Rating size="xs" rating={product.average_rating} totalReviews={product.total_reviews} />
              </td>
            ))}
          </tr>
          <tr>
            <td colSpan={products.length} className="border-b border-border bg-muted/40 px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Stock
            </td>
          </tr>
          <tr>
            {products.map((product) => (
              <td key={product._id} className="p-4 text-sm">
                {product.stock > 0 ? (
                  <span className="text-green-600">In stock</span>
                ) : (
                  <span className="text-red-600">Out of stock</span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CompareTable;
