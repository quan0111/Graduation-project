import {  API_URL_CATEGORY } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { ICategory } from "../types";
import { apiClient } from "@/lib/api";

interface CategoryApiResponse {
    data: ICategory[];
    count: number;
}

interface CategoryResponse {
    data: CategoryApiResponse;
    error: boolean;
    message: string;
    timestamp: string;
}

const getCategory = async (): Promise<CategoryResponse> => {
    const res = await apiClient.get(API_URL_CATEGORY);
    return res.data;
};

export const useGetCategory = (
    config?: Omit<
        UseQueryOptions<CategoryResponse, Error, CategoryResponse, [string]>,
        "queryKey" | "queryFn"
    >,
) => {
    return useQuery<CategoryResponse, Error, CategoryResponse, [string]>({
        queryKey: ["Categories"],
        queryFn: () => getCategory(),
        ...config,
    });
};
