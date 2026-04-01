import {  API_URL_PRODUCT } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { IProduct } from "../types";
import { apiClient } from "@/lib/api";

interface ProductApiResponse {
    data: IProduct[];
    count: number;
}

interface ProductResponse {
    data: ProductApiResponse;
    error: boolean;
    message: string;
    timestamp: string;
}

const getProductByID = async (id:number): Promise<ProductResponse> => {
    const res = await apiClient.get(`${API_URL_PRODUCT}${id}`);
    return res.data;
};

export const useGetProductByID = (
    id: number,
    config?: Omit<
        UseQueryOptions<ProductResponse, Error, ProductResponse, [string, number]>,
        "queryKey" | "queryFn"
    >,
) => {
    return useQuery<ProductResponse, Error, ProductResponse, [string, number]>({
        queryKey: ["products", id],
        queryFn: () => getProductByID(id),
        ...config,
    });
};


