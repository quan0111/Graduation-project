import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_ADMIN } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { ISellerFilter } from "../types";


export const updateSeller = async ({
    shopId,
    data,
}: {
    shopId: number;
    data: ISellerFilter;
}): Promise<any> => {
    const response = await apiClient.patch(
        `${API_URL_ADMIN}/sellers/${shopId}`,
        data
    );
    return response.data;
};

type UseUpdateSellerOptions = {
    config?: MutationConfig<typeof updateSeller>;
};

export const useUpdateSeller = ({
    config,
}: UseUpdateSellerOptions = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateSeller,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin-sellers"],
            });
        },

        ...config,
    });
};