import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API_URL_COUPON } from "@/constant/config";
import type { ICoupon } from "../types";

export type UpdateCouponDto = Partial<ICoupon>;

interface UpdateCouponResponse {
    data: ICoupon;
    error: boolean;
    message: string;
    timestamp: string;
}

const updateCoupon = async (
    id: string,
    data: UpdateCouponDto,
): Promise<UpdateCouponResponse> => {
    const res = await apiClient.patch(`${API_URL_COUPON}/${id}`, data);
    return res.data;
};

export const useUpdateCoupon = (
    config?: UseMutationOptions<
        UpdateCouponResponse,
        Error,
        { id: string; data: UpdateCouponDto }
    >,
) => {
    return useMutation({
        mutationFn: ({ id, data }) => updateCoupon(id, data),
        ...config,
    });
};
