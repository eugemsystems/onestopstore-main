"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { CartProvider, useCart } from "react-use-cart";
import { useSession } from "next-auth/react";

import { toTemplateProduct } from "@services/laravelAdapter";
import {
  fetchServerCart,
  createServerCartItem,
  replaceServerCartItem,
  deleteServerCartItem,
  clearServerCart,
} from "@services/LaravelCart";

const PULL_THROTTLE_MS = 15000;

// Cart line "id" -> the server-side cart row id it's synced to, for this
// browser session. Not persisted — a fresh page load re-establishes it via
// CartServerMerge's initial pull, keyed back onto matching local lines.
const ServerIdMapContext = createContext(null);

/**
 * A cart line's `id` is either the plain product id ("1425296") or, for a
 * selected variation, "<productId>-<variationId>" (see useProductAction's
 * handleAddToCart / ProductCard's handleAddItem). `_id` is always the bare
 * product id string, untouched by that composite — read it back out of
 * that, rather than the item's own (deliberately overwritten) `variant`
 * field, which ProductCard.jsx also repurposes to hold plain price data on
 * non-variant items.
 */
function parseCartLine(item) {
  const productIdStr = String(item._id ?? item.id);
  const rawId = String(item.id);
  let variation_id = null;
  if (rawId.length > productIdStr.length && rawId.startsWith(`${productIdStr}-`)) {
    const suffix = rawId.slice(productIdStr.length + 1);
    const parsed = Number(suffix);
    if (Number.isFinite(parsed)) variation_id = parsed;
  }
  return { product_id: Number(productIdStr), variation_id };
}

/**
 * Pulls the signed-in user's server cart on mount, on login, and on tab
 * focus (throttled), merging it into the local (localStorage) cart —
 * cross-device items appear, and quantities reconcile to whichever side has
 * more (never silently shrinks either side). Renders nothing.
 */
function CartServerMerge() {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const { items, addItem, updateItemQuantity } = useCart();
  const serverIdMap = useContext(ServerIdMapContext);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const lastPullRef = useRef(0);

  const pullAndMerge = useCallback(async () => {
    if (!token) return;
    const now = Date.now();
    if (now - lastPullRef.current < PULL_THROTTLE_MS) return;
    lastPullRef.current = now;

    const serverItems = await fetchServerCart(token);

    for (const row of serverItems) {
      const variationId = row.variation_id ?? null;
      const localId = variationId ? `${row.product_id}-${variationId}` : String(row.product_id);
      serverIdMap.current.set(localId, row.id);

      const existing = itemsRef.current.find((i) => i.id === localId);
      if (existing) {
        const merged = Math.max(existing.quantity, row.quantity);
        if (merged !== existing.quantity) {
          updateItemQuantity(localId, merged);
        }
        if (merged !== row.quantity) {
          replaceServerCartItem(token, {
            id: row.id,
            product_id: row.product_id,
            variation_id: variationId,
            quantity: merged,
          });
        }
        continue;
      }

      if (!row.product) continue;
      const templateProduct = toTemplateProduct(row.product);
      if (!templateProduct) continue;

      const variant = variationId
        ? templateProduct.variants.find((v) => v.id === variationId)
        : null;

      addItem(
        {
          ...templateProduct,
          id: localId,
          price: variant ? variant.price : templateProduct.prices.price,
          variant: variant || null,
        },
        row.quantity,
      );
    }
  }, [token, addItem, updateItemQuantity, serverIdMap]);

  // Pull on mount and whenever the session goes from signed-out to signed-in.
  useEffect(() => {
    pullAndMerge();
  }, [token, pullAndMerge]);

  // Cross-device changes show up next time the tab regains focus, at most
  // once every PULL_THROTTLE_MS.
  useEffect(() => {
    const onFocus = () => pullAndMerge();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [pullAndMerge]);

  return null;
}

/**
 * Wraps react-use-cart's CartProvider with the hooks needed to mirror every
 * local mutation to the Laravel /cart API for signed-in users. localStorage
 * stays the source of truth for what renders — these are fire-and-forget
 * background calls that never block or fail the local action.
 */
export default function CartSyncProvider({ children }) {
  const { data: session } = useSession();
  const tokenRef = useRef(session?.user?.token);
  tokenRef.current = session?.user?.token;

  const serverIdMap = useRef(new Map());

  const onItemAdd = useCallback((item) => {
    const token = tokenRef.current;
    if (!token) return;
    const { product_id, variation_id } = parseCartLine(item);
    createServerCartItem(token, { product_id, variation_id, quantity: item.quantity }).then(
      (row) => {
        if (row?.id) serverIdMap.current.set(item.id, row.id);
      },
    );
  }, []);

  const onItemUpdate = useCallback((item) => {
    const token = tokenRef.current;
    if (!token) return;
    const { product_id, variation_id } = parseCartLine(item);
    const serverId = serverIdMap.current.get(item.id);

    if (serverId) {
      // PUT /replace/cart sets quantity absolutely — never store/update
      // (POST /cart, PUT /cart), which ADD onto the existing server
      // quantity and would double-count on every edit.
      replaceServerCartItem(token, {
        id: serverId,
        product_id,
        variation_id,
        quantity: item.quantity,
      });
    } else {
      // Line was added while signed out and hasn't been through the login
      // merge yet — create it now with the current absolute quantity.
      createServerCartItem(token, { product_id, variation_id, quantity: item.quantity }).then(
        (row) => {
          if (row?.id) serverIdMap.current.set(item.id, row.id);
        },
      );
    }
  }, []);

  const onItemRemove = useCallback((id) => {
    const token = tokenRef.current;
    const serverId = serverIdMap.current.get(id);
    serverIdMap.current.delete(id);
    if (token && serverId) deleteServerCartItem(token, serverId);
  }, []);

  const onEmptyCart = useCallback(() => {
    const token = tokenRef.current;
    serverIdMap.current.clear();
    if (token) clearServerCart(token);
  }, []);

  return (
    <ServerIdMapContext.Provider value={serverIdMap}>
      <CartProvider
        onItemAdd={onItemAdd}
        onItemUpdate={onItemUpdate}
        onItemRemove={onItemRemove}
        onEmptyCart={onEmptyCart}
      >
        <CartServerMerge />
        {children}
      </CartProvider>
    </ServerIdMapContext.Provider>
  );
}
