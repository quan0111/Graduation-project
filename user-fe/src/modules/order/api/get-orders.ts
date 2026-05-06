import {  API_URL_ORDER } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { IOrder } from "../types";
import { apiClient } from "@/lib/api";


const getOrder = async (): Promise<IOrder[]> => {
    const res = await apiClient.get(API_URL_ORDER);
    return res.data;
};

export const useGetOrder = (
    config?: Omit<
        UseQueryOptions<IOrder[], Error, IOrder[], [string]>,
        "queryKey" | "queryFn"
    >,
) => {
    return useQuery<IOrder[], Error, IOrder[], [string]>({
        queryKey: ["Orders"],
        queryFn: () => getOrder(),
        ...config,
    });
};
