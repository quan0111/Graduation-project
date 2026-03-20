import {  API_URL_CART } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { ICart } from "../types";
import { apiClient } from "@/lib/api";

interface CartApiResponse {
    data: ICart[];
    count: number;
}

interface CartResponse {
    data: CartApiResponse;
    error: boolean;
    message: string;
    timestamp: string;
}

const getCart = async (): Promise<CartResponse> => {
    const res = await apiClient.get(API_URL_CART);
    return res.data;
};

export const useGetCart = (
    config?: Omit<
        UseQueryOptions<CartResponse, Error, CartResponse, [string]>,
        "queryKey" | "queryFn"
    >,
) => {
    return useQuery<CartResponse, Error, CartResponse, [string]>({
        queryKey: ["Carts"],
        queryFn: () => getCart(),
        ...config,
    });
};
