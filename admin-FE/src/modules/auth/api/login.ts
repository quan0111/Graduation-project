import { API_URL_LOGIN } from "../../../constant/config";
import { apiClient } from "../../../lib/api";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import type { IAuth,AuthResponse } from "../types";
import type { MutationConfig } from "../../../lib/react-query";


export const Login = async (data: IAuth): Promise<AuthResponse> => {
    const respone = await apiClient.post(`${API_URL_LOGIN}/login`, data)
    return respone.data
}; 

type UseLoginOption = {
    config?: MutationConfig<typeof Login>
}

export const useLogin =({ config }: UseLoginOption = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: Login,
        onMutate:() => {},
        onError:(error) =>{
            throw(error);
        },
        onSuccess: async(data) => {
            if (data?.access_token) {
                localStorage.setItem("token", data.access_token);
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