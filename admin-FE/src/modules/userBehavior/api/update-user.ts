import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API_URL_BEHAVIOR } from "@/constant/config";
import type { IUserBehavior } from "@/modules/user/types";

export type UpdateBehaviorDto = Partial<IUserBehavior>;

interface UpdateBehaviorResponse {
    data: IUserBehavior;
    error: boolean;
    message: string;
    timestamp: string;
}

const updateBehavior = async (
    id: string,
    data: UpdateBehaviorDto,
): Promise<UpdateBehaviorResponse> => {
    const res = await apiClient.patch(`${API_URL_BEHAVIOR}/${id}`, data);
    return res.data;
};

export const useUpdateBehavior = (
    config?: UseMutationOptions<
        UpdateBehaviorResponse,
        Error,
        { id: string; data: UpdateBehaviorDto }
    >,
) => {
    return useMutation({
        mutationFn: ({ id, data }) => updateBehavior(id, data),
        ...config,
    });
};
