import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL_USER } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

export interface User {
    id: number;
    email: string;
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
    role: "ADMIN" | "SELLER" | "CUSTOMER";
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileRequest {
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
}

export interface UpdatePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

// Get current user profile
export const getCurrentUser = async (): Promise<User> => {
    const response = await apiClient.get(`${API_URL_USER}/me`);
    return response.data;
};

export const useGetCurrentUser = (
    config?: Omit<UseQueryOptions<User, Error>, "queryKey" | "queryFn">
) => {
    return useQuery<User, Error>({
        queryKey: ["user", "me"],
        queryFn: getCurrentUser,
        ...config,
    });
};

// Update user profile
export const updateProfile = async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put(`${API_URL_USER}/me`, data);
    return response.data;
};

export const useUpdateProfile = ({ config }: { config?: MutationConfig<typeof updateProfile> } = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProfile,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["user", "me"] });
        },
        ...config,
    });
};

// Update avatar
export const updateAvatar = async (avatarUrl: string): Promise<User> => {
    const response = await apiClient.put(`${API_URL_USER}/me/avatar`, { avatarUrl });
    return response.data;
};

export const useUpdateAvatar = ({ config }: { config?: MutationConfig<typeof updateAvatar> } = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateAvatar,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["user", "me"] });
        },
        ...config,
    });
};

// Change password
export const changePassword = async (data: UpdatePasswordRequest): Promise<void> => {
    await apiClient.post(`${API_URL_USER}/me/change-password`, data);
};

export const useChangePassword = ({ config }: { config?: MutationConfig<typeof changePassword> } = {}) => {
    return useMutation({
        mutationFn: changePassword,
        ...config,
    });
};

// Get user by ID
export const getUserById = async (id: number): Promise<User> => {
    const response = await apiClient.get(`${API_URL_USER}/${id}`);
    return response.data;
};

export const useGetUserById = (
    id: number,
    config?: Omit<UseQueryOptions<User, Error>, "queryKey" | "queryFn">
) => {
    return useQuery<User, Error>({
        queryKey: ["user", id],
        queryFn: () => getUserById(id),
        ...config,
    });
};

// Delete user account
export const deleteAccount = async (): Promise<void> => {
    await apiClient.delete(`${API_URL_USER}/me`);
};

export const useDeleteAccount = ({ config }: { config?: MutationConfig<typeof deleteAccount> } = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteAccount,
        onSuccess: async () => {
            await queryClient.clear();
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        },
        ...config,
    });
};