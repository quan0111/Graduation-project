import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_USER } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { IUser } from "../types";

export const createUser = async (data: IUser): Promise<any> => {
    const response = await apiClient.post(`${API_URL_USER}`, data);
    return response.data.data;
};

type UseCreateUserOptions = {
    config?: MutationConfig<typeof createUser>;
};

export const useCreateUSer = ({
    config,
}: UseCreateUserOptions = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createUser,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["users"],
            });
        },
        ...config,
    });
};
