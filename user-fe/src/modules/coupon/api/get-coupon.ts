import {  API_URL_COUPON } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { ICoupon } from "../types";
import { apiClient } from "@/lib/api";

type CouponResponse = ICoupon[] | {
    data?: ICoupon[] | { data?: ICoupon[] };
    error?: boolean;
    message?: string;
    timestamp?: string;
};

const getCoupon = async (): Promise<CouponResponse> => {
    const res = await apiClient.get(API_URL_COUPON);
    return res.data;
};

const getCouponByCode = async (code: string): Promise<ICoupon> => {
    const res = await apiClient.get(`${API_URL_COUPON}/code/${code}`);
    return res.data;
};

const validateCoupon = async (code: string, orderAmount: number, shopIds: number[] = []) => {
    const res = await apiClient.post(`${API_URL_COUPON}/validate`, {
        code,
        orderAmount,
        shopIds,
    });
    return res.data;
};

const calculateDiscount = async (couponId: number, orderAmount: number, shopIds: number[] = []) => {
    const res = await apiClient.post(`${API_URL_COUPON}/discount`, {
        couponId,
        orderAmount,
        shopIds,
    });
    return res.data;
};

export const useGetCoupon = (
    config?: Omit<
        UseQueryOptions<CouponResponse, Error, CouponResponse, [string]>,
        "queryKey" | "queryFn"
    >,
) => {
    return useQuery<CouponResponse, Error, CouponResponse, [string]>({
        queryKey: ["coupons"],
        queryFn: () => getCoupon(),
        ...config,
    });
};

export const useCouponByCode = (
  code: string,
  config?: Partial<UseQueryOptions<ICoupon, Error>>,
) => {
  return useQuery({
    queryKey: ["coupon", "code", code],
    queryFn: () => getCouponByCode(code),
    ...config,
  });
};

export const useValidateCoupon = (
  code: string,
  orderAmount: number,
  shopIds: number[] = [],
  config?: Partial<UseQueryOptions<any, Error>>,
) => {
  return useQuery({
    queryKey: ["coupon", "validate", code, orderAmount, shopIds.join(",")],
    queryFn: () => validateCoupon(code, orderAmount, shopIds),
    ...config,
  });
};

export const useCalculateDiscount = (
  couponId: number,
  orderAmount: number,
  shopIds: number[] = [],
  config?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: ["coupon", "discount", couponId, orderAmount, shopIds.join(",")],
    queryFn: () => calculateDiscount(couponId, orderAmount, shopIds),
    ...config,
  });
};
