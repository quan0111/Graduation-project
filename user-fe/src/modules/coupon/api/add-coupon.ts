import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_COUPON } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { ICoupon } from "../types";

export const createCoupon = async (data: ICoupon): Promise<any> => {
    const response = await apiClient.post(`${API_URL_COUPON}`, data);
    return response.data.data;
};

type UseCreateCouponOptions = {
    config?: MutationConfig<typeof createCoupon>;
};

export const useCreateCoupon = ({
    config,
}: UseCreateCouponOptions = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCoupon,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["coupons"],
            });
        },
        ...config,
    });
};
