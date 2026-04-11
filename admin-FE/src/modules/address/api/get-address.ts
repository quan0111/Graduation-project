import {  API_URL_ADDRESS } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { IAddress } from "../types";
import { apiClient } from "@/lib/api";

interface AddressApiResponse {
    data: IAddress[];
    count: number;
}

interface AddressResponse {
    data: AddressApiResponse;
    error: boolean;
    message: string;
    timestamp: string;
}

const getAddress = async (): Promise<AddressResponse> => {
    const res = await apiClient.get(API_URL_ADDRESS);
    return res.data;
};

export const useGetAddress = (
    config?: Omit<
        UseQueryOptions<AddressResponse, Error, AddressResponse, [string]>,
        "queryKey" | "queryFn"
    >,
) => {
    return useQuery<AddressResponse, Error, AddressResponse, [string]>({
        queryKey: ["Addresss"],
        queryFn: () => getAddress(),
        ...config,
    });
};
