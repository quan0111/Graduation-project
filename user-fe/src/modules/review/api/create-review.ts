import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { API_URL_REVIEW } from "@/constant/config";
import { apiClient } from "@/lib/api";

export interface ReviewCreatePayload {
  userId: number;
  productId: number;
  rating: number;
  comment?: string;
  images?: File[];
}

const createReview = async (payload: ReviewCreatePayload) => {
  const formData = new FormData();
  formData.append("userId", payload.userId.toString());
  formData.append("productId", payload.productId.toString());
  formData.append("rating", payload.rating.toString());
  if (payload.comment) {
    formData.append("comment", payload.comment);
  }
  if (payload.images && payload.images.length > 0) {
    payload.images.forEach((image) => {
      formData.append(`images`, image);
    });
  }

  const response = await apiClient.post(`${API_URL_REVIEW}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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
