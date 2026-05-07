import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { API_URL_COUPON } from "@/constant/config";
import { apiClient } from "@/lib/api";

export const ALL_PROMOTIONS = "Tất cả";

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  discount: string;
  category: string;
  code: string;
  used: number;
  total: number;
  validUntil: string | Date;
}

type CouponResponse = {
  id: number;
  code: string;
  description?: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  validUntil?: string | null;
  isActive: boolean;
  applicableShopId?: number | null;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const formatDiscount = (coupon: CouponResponse) =>
  coupon.discountType === "PERCENTAGE"
    ? `-${coupon.discountValue}%`
    : `-${formatCurrency(coupon.discountValue)}`;

const mapCouponToPromotion = (coupon: CouponResponse): Promotion => ({
  id: String(coupon.id),
  title: coupon.description || `Voucher ${coupon.code}`,
  description: coupon.minOrderAmount
    ? `Áp dụng cho đơn từ ${formatCurrency(coupon.minOrderAmount)}`
    : "Áp dụng cho đơn hàng đủ điều kiện",
  image: "/placeholder.svg",
  discount: formatDiscount(coupon),
  category: coupon.applicableShopId ? `Shop #${coupon.applicableShopId}` : ALL_PROMOTIONS,
  code: coupon.code,
  used: coupon.usedCount,
  total: coupon.usageLimit || Math.max(coupon.usedCount, 1),
  validUntil: coupon.validUntil || new Date().toISOString(),
});

export const usePromotionCoupons = () =>
  useQuery({
    queryKey: ["promotions", "coupons"],
    queryFn: async () => {
      const res = await apiClient.get<CouponResponse[]>(API_URL_COUPON);
      return res.data.filter((coupon) => coupon.isActive).map(mapCouponToPromotion);
    },
  });

export const usePromotions = (data: Promotion[]) => {
  const [category, setCategory] = useState(ALL_PROMOTIONS);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return category === ALL_PROMOTIONS
      ? data
      : data.filter((promotion) => promotion.category === category || promotion.category === ALL_PROMOTIONS);
  }, [category, data]);

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return {
    category,
    setCategory,
    filtered,
    copied,
    copy,
  };
};
