import {  API_URL_USER } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { IUser } from "../types";
import { apiClient } from "@/lib/api";

const getUser = async (): Promise<IUser[]> => {
    const res = await apiClient.get(API_URL_USER);
    return res.data;
};

export const useGetUser = (
    config?: Omit<
        UseQueryOptions<IUser[], Error, IUser[], [string]>,
        "queryKey" | "queryFn"
    >,
) => {
    return useQuery<IUser[], Error, IUser[], [string]>({
        queryKey: ["users"],
        queryFn: () => getUser(),
        ...config,
    });
};
