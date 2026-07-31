"use client";

import Link from "next/link";
import { useCart } from "react-use-cart";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";

//internal import
import useAddToCart from "@hooks/useAddToCart";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ImageWithFallback from "@components/common/ImageWithFallBack";

const CartItem = ({ item }) => {
  const { updateItemQuantity, removeItem } = useCart();
  const { handleIncreaseQuantity } = useAddToCart();
  const { formatPrice } = useUtilsFunction();

  const hasDiscount = item.originalPrice > item.price;
  const savings = hasDiscount ? (item.originalPrice - item.price) * item.quantity : 0;

  return (
    <div className="group w-full h-auto flex justify-start items-center py-4 transition-all relative border-b border-border/60 last:border-b-0">
      <div className="relative flex overflow-hidden shrink-0 cursor-pointer mr-4">
        <Link href={`/product/${item.slug || item.id}`}>
          <ImageWithFallback
            img
            width={40}
            height={40}
            src={item.image}
            alt={item.title}
            className="size-20 flex-none rounded-lg bg-muted object-cover border border-border/50"
          />
        </Link>
      </div>
      <div className="flex flex-col w-full overflow-hidden">
        <div className="flex">
          <div className="min-w-0 flex-1">
            <Link
              href={`/product/${item.slug || item.id}`}
              className="truncate text-sm font-medium text-foreground line-clamp-1 hover:text-primary transition-colors"
            >
              {item.title}
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <span>Item Price {formatPrice(item.price)}</span>
              {hasDiscount && (
                <del className="text-muted-foreground/60">
                  {formatPrice(item.originalPrice)}
                </del>
              )}
            </div>
          </div>
          <div className="ml-4 flow-root shrink-0">
            <button
              onClick={() => removeItem(item.id)}
              className="hover:text-red-600 text-red-400 text-lg cursor-pointer"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="font-semibold text-primary text-sm md:text-base leading-5">
            <span>{formatPrice(item.price * item.quantity)}</span>
            {savings > 0 && (
              <span className="block text-xs font-medium text-green-600">
                Save {formatPrice(savings)}
              </span>
            )}
          </div>

          <div className="h-8 w-22 md:w-24 lg:w-24 flex flex-wrap items-center justify-evenly p-1 border border-border bg-muted/50 text-foreground rounded-full">
            <button
              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
            >
              <span className="text-foreground text-base cursor-pointer hover:text-primary">
                <FiMinus />
              </span>
            </button>
            <p className="text-sm font-semibold text-foreground px-1">
              {item.quantity}
            </p>
            <button onClick={() => handleIncreaseQuantity(item)}>
              <span className="text-foreground text-base cursor-pointer hover:text-primary">
                <FiPlus />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
