import { useState } from "react";
import { useCart } from "react-use-cart";

import { notifyError, notifySuccess } from "@utils/toast";
import { canAddToCart } from "@utils/cartGuards";

const useAddToCart = () => {
  const [item, setItem] = useState(1);
  const { addItem, items, updateItemQuantity, totalItems } = useCart();
  // console.log('products',products)
  // console.log("items", items);

  /**
   * Resolve maximum stock for a product/cart-item.
   * Campaign items carry `inCampaign` + `campaignRemainingStock` on the cart item.
   */
  const getMaxStock = (product) => {
    if (product?.inCampaign && product?.campaignRemainingStock != null) {
      return product.campaignRemainingStock;
    }
    return product?.variants?.length > 0
      ? product?.variant?.quantity
      : product?.stock;
  };

  const handleAddItem = (product, quantity) => {
    const qty = quantity || item;
    const result = items.find((i) => i.id === product.id);
    const { variants, categories, description, campaign, ...updatedProduct } =
      product;

    if (!result) {
      const guard = canAddToCart(items, product);
      if (!guard.ok) return notifyError(guard.message);
    }

    const maxStock = getMaxStock(product);

    if (result !== undefined) {
      if (result?.quantity + qty <= maxStock) {
        addItem(updatedProduct, qty);
        notifySuccess(`${qty} ${product.title} added to cart!`);
      } else {
        notifyError("Insufficient stock!");
      }
    } else {
      if (qty <= maxStock) {
        addItem(updatedProduct, qty);
        notifySuccess(`${qty} ${product.title} added to cart!`);
      } else {
        notifyError("Insufficient stock!");
      }
    }
  };

  const handleIncreaseQuantity = (product) => {
    const result = items?.find((p) => p.id === product.id);
    const maxStock = getMaxStock(product);

    if (result) {
      if (result?.quantity + item <= maxStock) {
        updateItemQuantity(product.id, product.quantity + 1);
      } else {
        notifyError("Insufficient stock!");
      }
    }
  };

  return {
    item,
    setItem,
    totalItems,
    handleAddItem,
    handleIncreaseQuantity,
  };
};

export default useAddToCart;
