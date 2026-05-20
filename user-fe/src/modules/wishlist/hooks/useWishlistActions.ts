import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { getStoredStorefrontUser } from "@/lib/auth-storage";
import type { IProduct } from "@/modules/product/types";
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from "@/modules/wishlist/api/wishlist";

const TEXT = {
  loginRequired: "B\u1ea1n c\u1ea7n \u0111\u0103ng nh\u1eadp \u0111\u1ec3 l\u01b0u s\u1ea3n ph\u1ea9m y\u00eau th\u00edch",
  removed: "\u0110\u00e3 b\u1ecf kh\u1ecfi wishlist",
  saved: "\u0110\u00e3 l\u01b0u v\u00e0o wishlist",
  failed: "Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt wishlist",
};

export const useWishlistActions = () => {
  const navigate = useNavigate();
  const storefrontUser = getStoredStorefrontUser();
  const { data: wishlist = [], isLoading, isError } = useWishlist({ enabled: Boolean(storefrontUser) });
  const addWishlist = useAddToWishlist();
  const removeWishlist = useRemoveFromWishlist();
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);

  const wishlistIds = useMemo(
    () => new Set(wishlist.map((item) => item.productId)),
    [wishlist],
  );

  const toggleWishlist = async (product: IProduct) => {
    if (!storefrontUser) {
      toast.error(TEXT.loginRequired);
      navigate("/login", { state: { redirect: window.location.pathname } });
      return;
    }

    setPendingProductId(product.id);
    try {
      if (wishlistIds.has(product.id)) {
        await removeWishlist.mutateAsync(product.id);
        toast.success(TEXT.removed);
      } else {
        await addWishlist.mutateAsync(product.id);
        toast.success(TEXT.saved);
      }
    } catch (error) {
      console.error(error);
      toast.error(TEXT.failed);
    } finally {
      setPendingProductId(null);
    }
  };

  return {
    wishlist,
    isLoading,
    isError,
    wishlistIds,
    pendingProductId,
    toggleWishlist,
  };
};
