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

const getShopByID = async (id:number| string): Promise<ShopResponse> => {
    const res = await apiClient.get(`${API_URL_SHOP}/${id}`);
    return res.data;
};

export const useGetShopById = (
    id: number | string,
    config?: Omit<
        UseQueryOptions<ShopResponse, Error, ShopResponse, [string, number | string]>,
        "queryKey" | "queryFn"
    >,
) => {
    return useQuery<ShopResponse, Error, ShopResponse, [string, number | string]>({
        queryKey: ["shop", id],
        queryFn: () => getShopByID(id),
        enabled: !!id, // tránh gọi khi id undefined/null
        ...config,
    });
};
