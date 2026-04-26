import { API_URL_LOGIN } from "../../../constant/config";
import { apiClient } from "../../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IAuth, AuthResponse } from "../types";
import type { MutationConfig } from "../../../lib/react-query";
import { UserRole } from "@/constant";

export const Login = async (data: IAuth): Promise<AuthResponse> => {

    const response = await apiClient.post(`${API_URL_LOGIN}/login`, data
    );

    return response.data;
};

type UseLoginOption = {
    config?: MutationConfig<typeof Login>;
};

export const useLogin = ({ config }: UseLoginOption = {}) => {
    const queryClient = useQueryClient();

        return useMutation({
            mutationFn: Login,

            onSuccess: async (data) => {
            console.log("LOGIN DATA:", data);

            if (data?.user?.role !== UserRole.Admin) {
                return Promise.reject(new Error("Bạn không có quyền truy cập admin"));
            }

            if (data?.access_token) {
                localStorage.setItem("access_token", data.access_token);
            }

            if (data?.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            await queryClient.invalidateQueries({
                queryKey: ["auth"],
            });
        },

        onError: (error: any) => {
            console.error("Login failed:", error?.message || error);
        },

        ...config,
    });
};