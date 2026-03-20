import {  API_URL_SHOP } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { IShop } from "../types";
import { apiClient } from "@/lib/api";

interface ShopApiResponse {
    data: IShop[];
    count: number;
}

interface ShopResponse {
    data: ShopApiResponse;
    error: boolean;
    message: string;
    timestamp: string;
}

const getShop = async (): Promise<ShopResponse> => {
    const res = await apiClient.get(API_URL_SHOP);
    return res.data;
};

export const useGetShop = (
    config?: Omit<
        UseQueryOptions<ShopResponse, Error, ShopResponse, [string]>,
        "queryKey" | "queryFn"
    >,
) => {
    return useQuery<ShopResponse, Error, ShopResponse, [string]>({
        queryKey: ["shops"],
        queryFn: () => getShop(),
        ...config,
    });
};
