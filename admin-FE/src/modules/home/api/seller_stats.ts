import { useQuery } from "@tanstack/react-query";
import { API_URL_ADMIN } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { QueryConfig } from "@/lib/react-query";


export const getSellerStats = async (shopId: number) => {
    const response = await apiClient.get(
        `${API_URL_ADMIN}/sellers/${shopId}/stats`
    );
    return response.data;
};



type UseSellerStatsOptions = {
    shopId: number;
    config?: QueryConfig<typeof getSellerStats>;
};

export const useSellerStats = ({
    shopId,
    config,
}: UseSellerStatsOptions) => {
    return useQuery({
        queryKey: ["seller-stats", shopId],
        queryFn: () => getSellerStats(shopId),
        enabled: !!shopId,
        ...config,
    });
};