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

const getReviewsByProduct = async (productId: number): Promise<IReview[]> => {
    const res = await apiClient.get(`${API_URL_REVIEW}/product/${productId}`);
    return res.data;
};

const getReviewsByUser = async (userId: number): Promise<IReview[]> => {
    const res = await apiClient.get(`${API_URL_REVIEW}/user/${userId}`);
    return res.data;
};

const getReviewStats = async (productId: number) => {
    const res = await apiClient.get(`${API_URL_REVIEW}/product/${productId}/stats`);
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

export const useReviewsByProduct = (
    productId: number,
    config?: UseQueryOptions<IReview[], Error>,
) => {
    return useQuery({
        queryKey: ["reviews", "product", productId],
        queryFn: () => getReviewsByProduct(productId),
        ...config,
    });
};

export const useReviewsByUser = (
    userId: number,
    config?: UseQueryOptions<IReview[], Error>,
) => {
    return useQuery({
        queryKey: ["reviews", "user", userId],
        queryFn: () => getReviewsByUser(userId),
        ...config,
    });
};

export const useReviewStats = (
    productId: number,
    config?: UseQueryOptions<any, Error>,
) => {
    return useQuery({
        queryKey: ["reviews", "stats", productId],
        queryFn: () => getReviewStats(productId),
        ...config,
    });
};
