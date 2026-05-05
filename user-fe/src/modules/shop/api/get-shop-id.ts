import {  API_URL_SHOP } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { IShop } from "../types";
import { apiClient } from "@/lib/api";


const getShopByID = async (id:number): Promise<IShop> => {
    const res = await apiClient.get(`${API_URL_SHOP}/${id}`);
    return res.data;
};

export const useGetShopById = (
    id: number ,
    config?: Omit<
        UseQueryOptions<IShop, Error, IShop, [string, number | string]>,
        "queryKey" | "queryFn"
    >,
) => {
    return useQuery<IShop, Error, IShop, [string, number | string]>({
        queryKey: ["shop", id],
        queryFn: () => getShopByID(id),
        enabled: !!id, // tránh gọi khi id undefined/null
        ...config,
    });
};
