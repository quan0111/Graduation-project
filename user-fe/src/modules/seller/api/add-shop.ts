import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_SHOP } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { IShop } from "../types";

export const createShop = async (data: IShop): Promise<any> => {
    const response = await apiClient.post(`${API_URL_SHOP}`, data);
    return response.data.data;
};

type UseCreateShopOptions = {
    config?: MutationConfig<typeof createShop>;
};

export const useCreateShop = ({
    config,
}: UseCreateShopOptions = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createShop,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["shops"],
            });
        },
        ...config,
    });
};
