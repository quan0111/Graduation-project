import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API_URL_ORDER } from "@/constant/config";
import type { IOrder } from "../types";

export type UpdateOrderDto = Partial<IOrder>;

interface UpdateOrderResponse {
    data: IOrder;
    error: boolean;
    message: string;
    timestamp: string;
}

const updateOrder = async (
    id: string,
    data: UpdateOrderDto,
): Promise<UpdateOrderResponse> => {
    const res = await apiClient.patch(`${API_URL_ORDER}/${id}`, data);
    return res.data;
};

export const useUpdateOrder = (
    config?: UseMutationOptions<
        UpdateOrderResponse,
        Error,
        { id: string; data: UpdateOrderDto }
    >,
) => {
    return useMutation({
        mutationFn: ({ id, data }) => updateOrder(id, data),
        ...config,
    });
};
