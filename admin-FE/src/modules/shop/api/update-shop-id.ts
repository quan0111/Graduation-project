import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API_URL_SHOP } from "@/constant/config";
import type { IShop } from "../types";

export type UpdateShopDto = Partial<IShop>;

interface UpdateShopResponse {
    data: IShop;
    error: boolean;
    message: string;
    timestamp: string;
}

const updateShop = async (
    id: string,
    data: UpdateShopDto,
): Promise<UpdateShopResponse> => {
    const res = await apiClient.patch(`${API_URL_SHOP}/${id}`, data);
    return res.data;
};

export const useUpdateShop = (
    config?: UseMutationOptions<
        UpdateShopResponse,
        Error,
        { id: string; data: UpdateShopDto }
    >,
) => {
    return useMutation({
        mutationFn: ({ id, data }) => updateShop(id, data),
        ...config,
    });
};
