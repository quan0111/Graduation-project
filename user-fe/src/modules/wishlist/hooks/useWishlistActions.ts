import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { getStoredStorefrontUser } from "@/lib/auth-storage";
import type { IProduct } from "@/modules/product/types";
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from "@/modules/wishlist/api/wishlist";

const TEXT = {
  loginRequired: "Bạn cần đăng nhập để lưu sản phẩm yêu thích",
  removed: "Đã bỏ khỏi wishlist",
  saved: "Đã lưu vào wishlist",
  failed: "Không thể cập nhật wishlist",
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
