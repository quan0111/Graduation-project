import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API_URL_REVIEW } from "@/constant/config";
import type { IReview } from "../types";

export type UpdateReviewDto = Partial<IReview>;

interface UpdateReviewResponse {
    data: IReview;
    error: boolean;
    message: string;
    timestamp: string;
}

const updateReview = async (
    id: string,
    data: UpdateReviewDto,
): Promise<UpdateReviewResponse> => {
    const res = await apiClient.patch(`${API_URL_REVIEW}/${id}`, data);
    return res.data;
};

export const useUpdateReview = (
    config?: UseMutationOptions<
        UpdateReviewResponse,
        Error,
        { id: string; data: UpdateReviewDto }
    >,
) => {
    return useMutation({
        mutationFn: ({ id, data }) => updateReview(id, data),
        ...config,
    });
};
