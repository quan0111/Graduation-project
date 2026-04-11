import { API_URL_LOGIN } from "../../../constant/config";
import { apiClient } from "../../../lib/api";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import type { RegisterRequest, AuthResponse } from "../types";
import type { MutationConfig } from "../../../lib/react-query";

export const Register = async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post(`${API_URL_LOGIN}/register`, data)
    return response.data;
};

type UseRegisterOption = {
    config?: MutationConfig<typeof Register>
}

export const useRegister =({ config }: UseRegisterOption = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: Register,
        onMutate:() => {},
        onSuccess: async(data) => {
            if (data?.access_token) {
                localStorage.setItem("token", data.access_token);
            }
            if (data?.refresh_token) {
                localStorage.setItem("refresh_token", data.refresh_token);
            }
            if (data?.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }
            await queryClient.invalidateQueries({
                queryKey: ["auth"],
            });
        },
        ...config,
    }
    );
}