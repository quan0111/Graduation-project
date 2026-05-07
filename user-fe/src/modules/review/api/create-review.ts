import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { API_URL_REVIEW } from "@/constant/config";
import { apiClient } from "@/lib/api";

export interface ReviewCreatePayload {
  userId: number;
  productId: number;
  rating: number;
  comment?: string;
}

const createReview = async (payload: ReviewCreatePayload) => {
  const response = await apiClient.post(`${API_URL_REVIEW}/`, payload);
  return response.data;
};

export const useCreateReview = (
  config?: UseMutationOptions<any, Error, ReviewCreatePayload>,
) => {
  return useMutation({
    mutationFn: createReview,
    ...config,
  });
};
