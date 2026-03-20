import {  API_URL_ORDER } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { IOrder } from "../types";
import { apiClient } from "@/lib/api";

interface OrderApiResponse {
    data: IOrder[];
    count: number;
}

interface OrderResponse {
    data: OrderApiResponse;
    error: boolean;
    message: string;
    timestamp: string;
}

const getOrder = async (): Promise<OrderResponse> => {
    const res = await apiClient.get(API_URL_ORDER);
    return res.data;
};

export const useGetOrder = (
    config?: Omit<
        UseQueryOptions<OrderResponse, Error, OrderResponse, [string]>,
        "queryKey" | "queryFn"
    >,
) => {
    return useQuery<OrderResponse, Error, OrderResponse, [string]>({
        queryKey: ["Orders"],
        queryFn: () => getOrder(),
        ...config,
    });
};
