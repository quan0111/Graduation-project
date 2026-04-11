import {  API_URL_BEHAVIOR } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { IUserBehavior } from "@/modules/user/types";
import { apiClient } from "@/lib/api";

interface BehaviorApiResponse {
    data: IUserBehavior[];
    count: number;
}

interface BehaviorResponse {
    data: BehaviorApiResponse;
    error: boolean;
    message: string;
    timestamp: string;
}

const getBehavior = async (): Promise<BehaviorResponse> => {
    const res = await apiClient.get(API_URL_BEHAVIOR);
    return res.data;
};

export const useGetBehavior = (
    config?: Omit<
        UseQueryOptions<BehaviorResponse, Error, BehaviorResponse, [string]>,
        "queryKey" | "queryFn"
    >,
) => {
    return useQuery<BehaviorResponse, Error, BehaviorResponse, [string]>({
        queryKey: ["behaviors"],
        queryFn: () => getBehavior(),
        ...config,
    });
};
