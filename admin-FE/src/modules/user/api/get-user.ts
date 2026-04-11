import {  API_URL_USER } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { IUser } from "../types";
import { apiClient } from "@/lib/api";

interface UserApiResponse {
    data: IUser[];
    count: number;
}

interface UserResponse {
    data: UserApiResponse;
    error: boolean;
    message: string;
    timestamp: string;
}

const getUser = async (): Promise<UserResponse> => {
    const res = await apiClient.get(API_URL_USER);
    return res.data;
};

export const useGetUser = (
    config?: Omit<
        UseQueryOptions<UserResponse, Error, UserResponse, [string]>,
        "queryKey" | "queryFn"
    >,
) => {
    return useQuery<UserResponse, Error, UserResponse, [string]>({
        queryKey: ["users"],
        queryFn: () => getUser(),
        ...config,
    });
};
