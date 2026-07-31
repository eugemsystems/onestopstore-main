"use client";

import Image from "next/image";
import { resolveSwatchColor } from "@utils/variantColors";

/**
 * Small "this product has options" indicator shown on product cards — a row
 * of tiny swatches (variation photo, color dot, or letter chip) so a card
 * for a variant product (like "Bench Capper") doesn't look identical to a
 * plain one. Built from `product.variants` directly (present on every
 * endpoint) rather than `product.variantAttributes` (only the single-product
 * detail endpoint returns the named attribute list list pages need).
 */
const ProductVariantIndicator = ({ product }) => {
  const variants = product?.variants;
  if (!variants?.length) return null;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-1.5">
        {variants.slice(0, 4).map((variant) => {
          const swatchColor = resolveSwatchColor("colour", { value: variant.name });
          if (variant.image) {
            return (
              <span
                key={variant.id}
                title={variant.name}
                className="relative h-5 w-5 overflow-hidden rounded-full border border-background ring-1 ring-border"
              >
                <Image src={variant.image} alt={variant.name} fill sizes="20px" className="object-cover" />
              </span>
            );
          }
          if (swatchColor) {
            return (
              <span
                key={variant.id}
                title={variant.name}
                className="h-5 w-5 rounded-full border border-background ring-1 ring-border"
                style={{ backgroundColor: swatchColor }}
              />
            );
          }
          return (
            <span
              key={variant.id}
              title={variant.name}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-background bg-muted text-[8px] font-bold text-muted-foreground ring-1 ring-border"
            >
              {String(variant.name || "?").charAt(0).toUpperCase()}
            </span>
          );
        })}
      </div>
      {variants.length > 1 && (
        <span className="text-[10px] text-muted-foreground">{variants.length} options</span>
      )}
    </div>
  );
};

export default ProductVariantIndicator;
