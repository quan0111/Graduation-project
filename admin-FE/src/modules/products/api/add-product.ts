import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_PRODUCT } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { IProduct } from "../types";

export const createProduct = async (data: IProduct): Promise<any> => {
    const response = await apiClient.post(`${API_URL_PRODUCT}`, data);
    return response.data.data;
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
