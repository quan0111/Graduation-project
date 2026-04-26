import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_ADMIN } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";


export const bulkUpdateSeller = async ({
    ids,
    isActive,
}: {
    ids: number[];
    isActive: boolean;
}) => {
    const response = await apiClient.patch(
        `${API_URL_ADMIN}/sellers/bulk`,
        { ids, isActive }
    );
    return response.data;
};

type UseBulkUpdateSellerOptions = {
    config?: MutationConfig<typeof bulkUpdateSeller>;
};

export const useBulkUpdateSeller = ({
    config,
}: UseBulkUpdateSellerOptions = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: bulkUpdateSeller,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin-sellers"],
            });
        },

        ...config,
    });
};