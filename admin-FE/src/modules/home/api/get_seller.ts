import { useQuery } from "@tanstack/react-query";
import { API_URL_ADMIN } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { QueryConfig } from "@/lib/react-query";
import type { ISellerFilter, IPagination } from "../types";

export const getSellers = async ({
    filter,
    pagination,
}: {
    filter: ISellerFilter;
    pagination: IPagination;
}) => {
    const response = await apiClient.post(
        `${API_URL_ADMIN}/sellers`,
        {
            ...filter,
            ...pagination,
        }
    );
    return response.data;
};



type UseSellersOptions = {
    filter: ISellerFilter;
    pagination: IPagination;
    config?: QueryConfig<typeof getSellers>;
};

export const useSellers = ({
    filter,
    pagination,
    config,
}: UseSellersOptions) => {
    return useQuery({
        queryKey: ["admin-sellers", filter, pagination],
        queryFn: () => getSellers({ filter, pagination }),
        ...config,
    });
};