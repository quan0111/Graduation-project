import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_CART } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { ICart } from "../types";

export const createCart = async (data: ICart): Promise<any> => {
    const response = await apiClient.post(`${API_URL_CART}`, data);
    return response.data.data;
};

type UseCreateCartOptions = {
    config?: MutationConfig<typeof createCart>;
};

export const useCreateCart = ({
    config,
}: UseCreateCartOptions = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCart,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["carts"],
            });
        },
        ...config,
    });
};
