import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { API_URL_COUPON } from "@/constant/config";
import { apiClient } from "@/lib/api";

export interface CouponCreatePayload {
  code: string;
  description?: string;
  scope?: "ORDER" | "SHIPPING" | "SHOP" | "CATEGORY" | "PRODUCT";
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  validFrom?: string;
  validUntil?: string;
  applicableShopId?: number;
  applicableCategoryId?: number;
  applicableProductId?: number;
  applicableProductIds?: number[];
}

const createCoupon = async (payload: CouponCreatePayload) => {
  const response = await apiClient.post(`${API_URL_COUPON}/`, payload);
  return response.data;
};

export const useCreateCoupon = (
  config?: UseMutationOptions<any, Error, CouponCreatePayload>,
) => {
  return useMutation({
    mutationFn: createCoupon,
    ...config,
  });
};
