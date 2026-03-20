import {  API_URL_REVIEW } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { IReview } from "../types";
import { apiClient } from "@/lib/api";

interface ReviewApiResponse {
    data: IReview[];
    count: number;
}

interface ReviewResponse {
    data: ReviewApiResponse;
    error: boolean;
    message: string;
    timestamp: string;
}

const getReview = async (): Promise<ReviewResponse> => {
    const res = await apiClient.get(API_URL_REVIEW);
    return res.data;
};

export const useGetReview = (
    config?: Omit<
        UseQueryOptions<ReviewResponse, Error, ReviewResponse, [string]>,
        "queryKey" | "queryFn"
    >,
) => {
    return useQuery<ReviewResponse, Error, ReviewResponse, [string]>({
        queryKey: ["Reviews"],
        queryFn: () => getReview(),
        ...config,
    });
};
