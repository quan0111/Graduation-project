import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_PRODUCT } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";

export interface CreateProductPayload {
    name: string;
    slug?: string;
    categoryId: number;
    description: string;
    images: Array<{
        url: string;
        position: number;
        isPrimary?: boolean;
    }>;
    attributes: Array<{
        key: string;
        value: string;
    }>;
    variants: Array<{
        name: string;
        sku?: string;
        price: number;
        stock: number;
        weight?: number;
        images?: Array<{
            url: string;
            position: number;
        }>;
    }>;
}

export const createProduct = async (data: CreateProductPayload): Promise<any> => {
    const response = await apiClient.post(`${API_URL_PRODUCT}`, data);
    return response.data;
};

type UseCreateProductOptions = {
    config?: MutationConfig<typeof createProduct>;
};

export const useCreateProduct = ({
    config,
}: UseCreateProductOptions = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createProduct,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["products"],
            });
        },
        ...config,
    });
};
