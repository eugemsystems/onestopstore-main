"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  fetchWishlistIds,
  addToWishlist,
  removeFromWishlist,
  addToCompare,
  fetchCompareIds,
  removeFromCompare,
} from "@services/LaravelWishlistCompare";
import { notifySuccess, notifyError } from "@utils/toast";

const WishlistContext = createContext({
  wishlistIds: [],
  isWishlisted: () => false,
  toggleWishlist: () => {},
  addProductToCompare: () => {},
  compareIds: [],
  isCompared: () => false,
});

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const router = useRouter();
  const [wishlistIds, setWishlistIds] = useState([]);
  const [compareIds, setCompareIds] = useState([]);

  useEffect(() => {
    if (!token) {
      setWishlistIds([]);
      setCompareIds([]);
      return;
    }
    fetchWishlistIds(token).then(setWishlistIds);
    fetchCompareIds(token).then(setCompareIds);
  }, [token]);

  const isCompared = useCallback(
    (productId) => compareIds.includes(productId),
    [compareIds],
  );

  const isWishlisted = useCallback(
    (productId) => wishlistIds.includes(productId),
    [wishlistIds],
  );

  const toggleWishlist = useCallback(
    async (productId) => {
      if (!token) {
        router.push("/login");
        return;
      }
      if (isWishlisted(productId)) {
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
        const ok = await removeFromWishlist(token, productId);
        if (!ok) setWishlistIds((prev) => [...prev, productId]); // revert on failure
      } else {
        setWishlistIds((prev) => [...prev, productId]);
        const ok = await addToWishlist(token, productId);
        if (!ok) {
          setWishlistIds((prev) => prev.filter((id) => id !== productId));
          notifyError("Could not update wishlist");
        }
      }
    },
    [token, isWishlisted, router],
  );

  const addProductToCompare = useCallback(
    async (productId) => {
      if (!token) {
        router.push("/login");
        return;
      }
      if (isCompared(productId)) {
        notifySuccess("Already in your Compare List");
        return;
      }
      setCompareIds((prev) => [...prev, productId]);
      const ok = await addToCompare(token, productId);
      if (ok) notifySuccess("Added to Compare List");
      else {
        setCompareIds((prev) => prev.filter((id) => id !== productId));
        notifyError("Could not add to compare");
      }
    },
    [token, router, isCompared],
  );

  const removeProductFromCompare = useCallback(
    async (productId) => {
      if (!token) return;
      setCompareIds((prev) => prev.filter((id) => id !== productId));
      const ok = await removeFromCompare(token, productId);
      if (!ok) setCompareIds((prev) => [...prev, productId]);
    },
    [token],
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isWishlisted,
        toggleWishlist,
        addProductToCompare,
        compareIds,
        isCompared,
        removeProductFromCompare,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
