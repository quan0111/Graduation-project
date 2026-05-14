import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API_URL_USER } from "@/constant/config";
import type { IUser } from "../types";

export type UpdateUserDto = Partial<IUser>;

interface UpdateUserResponse {
    data: IUser;
    error: boolean;
    message: string;
    timestamp: string;
}

const updateUser = async (
    id: string,
    data: UpdateUserDto,
): Promise<UpdateUserResponse> => {
    const res = await apiClient.patch(`${API_URL_USER}/${id}`, data);
    return res.data;
};

export const useUpdateUser = (
    config?: UseMutationOptions<
        UpdateUserResponse,
        Error,
        { id: string; data: UpdateUserDto }
    >,
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables: { id: string; data: UpdateUserDto }) =>
            updateUser(variables.id, variables.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        ...config,
    });
};

// Toggle user status (active/inactive)
const toggleUserStatus = async (id: string, isActive: boolean): Promise<UpdateUserResponse> => {
    const res = await apiClient.patch(`${API_URL_USER}/${id}`, { isActive });
    return res.data;
};

export const useToggleUserStatus = (
    config?: UseMutationOptions<
        UpdateUserResponse,
        Error,
        { id: string; isActive: boolean }
    >,
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables: { id: string; isActive: boolean }) =>
            toggleUserStatus(variables.id, variables.isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        ...config,
    });
};
