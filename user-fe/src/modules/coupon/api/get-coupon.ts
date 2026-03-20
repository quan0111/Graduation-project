import {  API_URL_COUPON } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { ICoupon } from "../types";
import { apiClient } from "@/lib/api";

interface CouponApiResponse {
    data: ICoupon[];
    count: number;
}

interface CouponResponse {
    data: CouponApiResponse;
    error: boolean;
    message: string;
    timestamp: string;
}

const getCoupon = async (): Promise<CouponResponse> => {
    const res = await apiClient.get(API_URL_COUPON);
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
