import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API_URL_ADDRESS } from "@/constant/config";
import type { IAddress } from "../types";

export type UpdateAddressDto = Partial<IAddress>;

interface UpdateAddressResponse {
    data: IAddress;
    error: boolean;
    message: string;
    timestamp: string;
}

const updateAddress = async (
    id: string,
    data: UpdateAddressDto,
): Promise<UpdateAddressResponse> => {
    const res = await apiClient.patch(`${API_URL_ADDRESS}/${id}`, data);
    return res.data;
};

export const useUpdateAddress = (
    config?: UseMutationOptions<
        UpdateAddressResponse,
        Error,
        { id: string; data: UpdateAddressDto }
    >,
) => {
    return useMutation({
        mutationFn: ({ id, data }) => updateAddress(id, data),
        ...config,
    });
};
