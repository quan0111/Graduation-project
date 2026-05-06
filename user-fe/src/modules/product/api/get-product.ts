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

const getProduct = async (): Promise<ProductResponse> => {
    const res = await apiClient.get(API_URL_PRODUCT);
    return res.data;
};

export const useGetProduct = (
    config?: Omit<
        UseQueryOptions<ProductResponse, Error, ProductResponse, [string]>,
        "queryKey" | "queryFn"
    >,
) => {
    return useQuery<ProductResponse, Error, ProductResponse, [string]>({
        queryKey: ["products"],
        queryFn: () => getProduct(),
        ...config,
    });
};
