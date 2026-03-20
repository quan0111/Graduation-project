import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API_URL_CART } from "@/constant/config";
import type { ICart } from "../types";

export type UpdateCartDto = Partial<ICart>;

interface UpdateCartResponse {
    data: ICart;
    error: boolean;
    message: string;
    timestamp: string;
}

const updateCart = async (
    id: string,
    data: UpdateCartDto,
): Promise<UpdateCartResponse> => {
    const res = await apiClient.patch(`${API_URL_CART}/${id}`, data);
    return res.data;
};

export const useUpdateCart = (
    config?: UseMutationOptions<
        UpdateCartResponse,
        Error,
        { id: string; data: UpdateCartDto }
    >,
) => {
    return useMutation({
        mutationFn: ({ id, data }) => updateCart(id, data),
        ...config,
    });
};
