import { useQuery } from "@tanstack/react-query";
import { API_URL_ADMIN } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { QueryConfig } from "@/lib/react-query";
import type { IOrderFilter, IPagination } from "../types";


export const getOrders = async ({
    filter,
    pagination,
}: {
    filter: IOrderFilter;
    pagination: IPagination;
}) => {
    const response = await apiClient.post(
        `${API_URL_ADMIN}/orders`,
        {
            filter_data: filter,
            pagination,
        }
    );
    return response.data;
};

type UseOrdersOptions = {
    filter: IOrderFilter;
    pagination: IPagination;
    config?: QueryConfig<typeof getOrders>;
};

export const useOrders = ({
    filter,
    pagination,
    config,
}: UseOrdersOptions) => {
    return useQuery({
        queryKey: ["admin-orders", filter, pagination],
        queryFn: () => getOrders({ filter, pagination }),
        ...config,
    });
};
