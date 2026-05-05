import {  API_URL_PRODUCT } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { IProduct } from "../types";
import { apiClient } from "@/lib/api";



const getProductByID = async (id:number): Promise<IProduct> => {
    const res = await apiClient.get(`${API_URL_PRODUCT}/${id}`);
    return res.data;
};

export const useGetProductByID = (
    id: number,
    config?: Omit<
        UseQueryOptions<IProduct, Error, IProduct, [string, number]>,
        "queryKey" | "queryFn"
    >,
) => {
    return useQuery<IProduct, Error, IProduct, [string, number]>({
        queryKey: ["products", id],
        queryFn: () => getProductByID(id),
        ...config,
    });
};


