import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL_ADDRESS } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

export interface Address {
    id: number;
    userId: number;
    fullName: string;
    phone: string;
    addressLine: string;
    ward?: string;
    district: string;
    province: string;
    country: string;
    postalCode?: string;
    isDefault: boolean;
    type: "HOME" | "OFFICE" | "OTHER";
}

export interface CreateAddressRequest {
    fullName: string;
    phone: string;
    addressLine: string;
    ward?: string;
    district: string;
    province: string;
    postalCode?: string;
    type?: "HOME" | "OFFICE" | "OTHER";
    isDefault?: boolean;
}

export interface UpdateAddressRequest {
    id: number;
    fullName?: string;
    phone?: string;
    addressLine?: string;
    ward?: string;
    district?: string;
    province?: string;
    postalCode?: string;
    type?: "HOME" | "OFFICE" | "OTHER";
    isDefault?: boolean;
}

// Get all addresses
export const getAddresses = async (): Promise<Address[]> => {
    const response = await apiClient.get(API_URL_ADDRESS);
    return response.data;
};

export const useGetAddresses = (
    config?: Omit<UseQueryOptions<Address[], Error>, "queryKey" | "queryFn">
) => {
    return useQuery<Address[], Error>({
        queryKey: ["addresses"],
        queryFn: getAddresses,
        ...config,
    });
};

// Create address
export const createAddress = async (data: CreateAddressRequest): Promise<Address> => {
    const response = await apiClient.post(API_URL_ADDRESS, data);
    return response.data;
};

export const useCreateAddress = ({ config }: { config?: MutationConfig<typeof createAddress> } = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createAddress,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["addresses"] });
        },
        ...config,
    });
};

// Update address
export const updateAddress = async (data: UpdateAddressRequest): Promise<Address> => {
    const { id, ...updateData } = data;
    const response = await apiClient.put(`${API_URL_ADDRESS}/${id}`, updateData);
    return response.data;
};

export const useUpdateAddress = ({ config }: { config?: MutationConfig<typeof updateAddress> } = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateAddress,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["addresses"] });
        },
        ...config,
    });
};

// Delete address
export const deleteAddress = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_URL_ADDRESS}/${id}`);
};

export const useDeleteAddress = ({ config }: { config?: MutationConfig<typeof deleteAddress> } = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteAddress,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["addresses"] });
        },
        ...config,
    });
};

// Set default address
export const setDefaultAddress = async (id: number): Promise<Address> => {
    const response = await apiClient.patch(`${API_URL_ADDRESS}/${id}/default`);
    return response.data;
};

export const useSetDefaultAddress = ({ config }: { config?: MutationConfig<typeof setDefaultAddress> } = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: setDefaultAddress,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["addresses"] });
        },
        ...config,
    });
};