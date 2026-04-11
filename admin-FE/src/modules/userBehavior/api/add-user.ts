import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_BEHAVIOR } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { IUserBehavior } from "@/modules/user/types";

export const createBehavior = async (data: IUserBehavior): Promise<any> => {
    const response = await apiClient.post(`${API_URL_BEHAVIOR}`, data);
    return response.data.data;
};

type UseCreateBehaviorOptions = {
    config?: MutationConfig<typeof createBehavior>;
};

export const useCreateBehavior = ({
    config,
}: UseCreateBehaviorOptions = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBehavior,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["behaviors"],
            });
        },
        ...config,
    });
};
