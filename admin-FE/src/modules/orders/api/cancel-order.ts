import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";

export interface CancelOrderRequest {
    orderId: number;
    reason: string;
    note?: string;
}

export const cancelOrder = async (data: CancelOrderRequest): Promise<void> => {
    await apiClient.patch(`${API_URL_ORDER}/${data.orderId}/cancel`, {
        reason: data.reason,
        note: data.note,
    });
};

type UseCancelOrderOptions = {
    config?: MutationConfig<typeof cancelOrder>;
};

export const useCancelOrder = ({ config }: UseCancelOrderOptions = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cancelOrder,
        onMutate: () => {},
        onError: (error) => {
            console.error("Cancel order error:", error);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["orders"],
            });
        },
        ...config,
    });
};