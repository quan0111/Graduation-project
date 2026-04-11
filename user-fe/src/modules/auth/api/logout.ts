import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_LOGIN } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";

export const logout = async (): Promise<void> => {
    const token = localStorage.getItem("token");
    await apiClient.post(`${API_URL_LOGIN}/logout`, null, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

type UseLogoutOptions = {
    config?: MutationConfig<typeof logout>;
};

export const useLogout = ({ config }: UseLogoutOptions = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logout,
        onMutate: () => {},
        onError: (error) => {
            console.error("Logout error:", error);
        },
        onSuccess: async () => {
            await queryClient.clear();
        },
        ...config,
    });
};