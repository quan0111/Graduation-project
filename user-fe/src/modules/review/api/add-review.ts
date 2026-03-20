import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_REVIEW } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { IReview } from "../types";

export const createReview = async (data: IReview): Promise<any> => {
    const response = await apiClient.post(`${API_URL_REVIEW}`, data);
    return response.data.data;
};

type UseCreateReviewOptions = {
    config?: MutationConfig<typeof createReview>;
};

export const useCreateReview = ({
    config,
}: UseCreateReviewOptions = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createReview,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["reviews"],
            });
        },
        ...config,
    });
};
