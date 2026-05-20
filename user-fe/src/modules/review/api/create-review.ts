import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { API_URL_REVIEW } from "@/constant/config";
import { apiClient } from "@/lib/api";
import { uploadMedia } from "@/modules/upload/api/upload-image";

export interface ReviewCreatePayload {
  userId: number;
  productId: number;
  rating: number;
  comment?: string;
  images?: File[];
  media?: File[];
}

const createReview = async (payload: ReviewCreatePayload) => {
  const files = payload.media ?? payload.images ?? [];
  const mediaUrls = files.length
    ? await Promise.all(
        files.map((file) =>
          uploadMedia({ file, folder: "reviews" }).then((result) => result.url),
        ),
      )
    : [];

  const response = await apiClient.post(`${API_URL_REVIEW}/`, {
    userId: payload.userId,
    productId: payload.productId,
    rating: payload.rating,
    comment: payload.comment,
    mediaUrls,
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
