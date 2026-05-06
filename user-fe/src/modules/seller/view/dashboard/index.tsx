'use client';

import { useEffect } from "react";
import { useNavigate as useReactNavigate } from "react-router-dom";

import { useMe } from "@/modules/auth/api/get-auth-me";

import { useGetShopByOwnerId } from "@/modules/shop/api/shop";
import { useGetProductsByShop } from "@/modules/product/api/get-product-by-shop";

export default function SellerDashboardPage() {

  const navigate = useReactNavigate();

  // ✅ lấy user hiện tại
  const { data: me, isLoading: meLoading } = useMe();

  // ✅ check role
  useEffect(() => {

    if (meLoading) return;

    // chưa login
    if (!me) {
      navigate("/login");
      return;
    }

    if (me.role !== "SELLER") {
      navigate("/seller");
      return;
    }

  }, [me, meLoading, navigate]);

  const isSeller = me?.role === "SELLER";

  const {
    data: shop,
    isLoading: shopLoading
  } = useGetShopByOwnerId({
    enabled: isSeller,
  });

  const {
    data: products = [],
    isLoading: productsLoading,
  } = useGetProductsByShop(
    shop?.id || 0,
    {
      enabled: !!shop,
    }
  );

  // loading tổng
  const isLoading =
    meLoading ||
    shopLoading ||
    (shop && productsLoading);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      Seller dashboard
    </div>
  );
}