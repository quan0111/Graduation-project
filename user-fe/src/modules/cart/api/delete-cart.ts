import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_CART } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";

export const deleteCartItem = async (itemId: number): Promise<void> => {
    await apiClient.delete(`${API_URL_CART}/items/${itemId}`);
};

type UseDeleteCartItemOptions = {
    config?: MutationConfig<typeof deleteCartItem>;
};

export const useDeleteCartItem = ({ config }: UseDeleteCartItemOptions = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCartItem,
        onMutate: () => {},
        onError: (error) => {
            console.error("Delete cart item error:", error);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["cart"],
            });
        },
        ...config,
    });
};