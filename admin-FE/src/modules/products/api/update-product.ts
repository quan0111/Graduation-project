import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API_URL_PRODUCT } from "@/constant/config";
import type { IProduct } from "../types";

export type UpdateProductDto = Partial<IProduct>;

interface UpdateProductResponse {
    data: IProduct;
    error: boolean;
    message: string;
    timestamp: string;
}

const updateProduct = async (
    id: string,
    data: UpdateProductDto,
): Promise<UpdateProductResponse> => {
    const res = await apiClient.patch(`${API_URL_PRODUCT}/${id}`, data);
    return res.data;
};

export const useUpdateProduct = (
    config?: UseMutationOptions<
        UpdateProductResponse,
        Error,
        { id: string; data: UpdateProductDto }
    >,
) => {
    return useMutation({
        mutationFn: ({ id, data }) => updateProduct(id, data),
        ...config,
    });
};
