'use client';

import { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { useGetShopById } from "../api/get-shop-id";
import { useFollowShop, useIsFollowingShop, useShopFollowerCount, useUnfollowShop } from "../api/follow-shop";
import { useGetProductsByShop } from "@/modules/product/api/get-product-by-shop";
import { ChatWithShopButton } from "@/modules/support/components/chat-with-shop-button";
import { useAuthStore } from "@/stores/auth.store";

export default function ShopPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const shopId = Number(id);
  const hasValidShopId = Boolean(id) && Number.isFinite(shopId) && shopId > 0;

  // ✅ chỉ gọi API khi có id hợp lệ
  const {
    data: shop,
    isLoading: shopLoading,
  } = useGetShopById(shopId, {
    enabled: hasValidShopId,
  });

  const {
    data: productsRes,
    isLoading: productLoading,
  } = useGetProductsByShop(shopId, {
    enabled: hasValidShopId,
  });
  const { data: isFollowing = false } = useIsFollowingShop(shopId, hasValidShopId && Boolean(user));
  const { data: followerCount = 0 } = useShopFollowerCount(shopId);
  const followMutation = useFollowShop();
  const unfollowMutation = useUnfollowShop();

  const products = Array.isArray(productsRes)
    ? productsRes
    : Array.isArray(productsRes)
    ? productsRes
    : [];

  const [activeTab, setActiveTab] = useState('products');

  if (!hasValidShopId) {
    return <div>Shop ID không hợp lệ</div>;
  }

  const handleToggleFollow = async () => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để theo dõi shop");
      navigate("/login", { state: { redirect: `/shop/${shopId}` } });
      return;
    }

    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync(shopId);
        toast.success("Đã bỏ theo dõi shop");
      } else {
        await followMutation.mutateAsync(shopId);
        toast.success("Đã theo dõi shop");
      }
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Không thể cập nhật theo dõi shop");
    }
  };

  if (shopLoading || productLoading) {
    return <div className="p-6">Đang tải...</div>;
  }

  if (!shop) {
    return <div className="p-6">Không tìm thấy shop</div>;
  }

  return (
    <main className="min-h-screen bg-background">

      {/* Banner */}
      <div className="h-48 md:h-64 bg-muted">
        <img
          src={shop.avatar_url || "/default-avatar.png"}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="relative -mt-16 mb-8">
          <Card className="p-6">
            <div className="flex gap-6">

              <img
                src={shop.avatar_url || "/default-avatar.png"}
                className="w-32 h-32 rounded-lg"
              />

              <div className="flex-1">
                <h1 className="text-3xl font-bold">{shop.name}</h1>
                <p className="text-muted-foreground">{shop.description}</p>

                <div className="flex gap-4 mt-3">
                  <span>{products.length} sản phẩm</span>
                  <span>{followerCount} người theo dõi</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <ChatWithShopButton shopId={shop.id} shopName={shop.name} className="border-[#ee4d2d] text-[#ee4d2d]">
                  Chat với shop
                </ChatWithShopButton>
                <Button
                  onClick={handleToggleFollow}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                >
                  {isFollowing ? "Đã theo dõi" : "Theo dõi"}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* TAB */}
        <div className="flex gap-4 mb-6 border-b">
          {["products", "info"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 ${activeTab === tab ? "text-primary border-b-2 border-primary" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* PRODUCTS */}
        {activeTab === "products" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {products.length === 0 && (
              <div className="col-span-full text-center text-gray-500">
                Chưa có sản phẩm
              </div>
            )}

            {products.map((p: any) => (
              <Card key={p.id} className="overflow-hidden">

                <img
                  src={p.images?.[0]?.url || "/placeholder.png"}
                  className="w-full h-40 object-cover"
                />

                <div className="p-3">
                  <h3 className="text-sm">{p.name}</h3>

                  <p className="text-primary font-bold">
                    {(p.price || 0).toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </Card>
            ))}

          </div>
        )}

        {/* INFO */}
        {activeTab === "info" && (
          <Card className="p-6">
            <p>{shop.description}</p>
          </Card>
        )}

      </div>
    </main>
  );
}
