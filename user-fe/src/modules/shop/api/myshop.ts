import { API_URL_SHOP } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import type { IShop } from "../types";

import { apiClient } from "@/lib/api";

const getMyShop = async (): Promise<IShop> => {

    const res = await apiClient.get(
        `${API_URL_SHOP}/me`
    );

    return res.data;
};

export const useGetMyShop = (
    config?: Omit<
        UseQueryOptions<IShop, Error, IShop, [string]>,
        "queryKey" | "queryFn"
    >,
) => {

    return useQuery<
        IShop,
        Error,
        IShop,
        [string]
    >({
        queryKey: ["my-shop"],

        queryFn: () => getMyShop(),

        ...config,
    });
};