import {  API_URL_PRODUCT } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { IProduct } from "../types";
import { apiClient } from "@/lib/api";



const getProductsByShop = async (shop_id:number): Promise<IProduct[]> => {
    const res = await apiClient.get(`${API_URL_PRODUCT}/products-by-shop/${shop_id}/`);
    return res.data;
};

export const useGetProductsByShop = (
    shop_id: number,
    config?: Omit<
        UseQueryOptions<IProduct[], Error, IProduct[], [string, number]>,
        "queryKey" | "queryFn"
    >,
) => {
    return useQuery<IProduct[], Error, IProduct[], [string, number]>({
        queryKey: ["products", shop_id],
        queryFn: () => getProductsByShop(shop_id),
        ...config,
    });
};


