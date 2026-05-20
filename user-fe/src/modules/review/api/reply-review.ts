import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";

import { API_URL_REVIEW } from "@/constant/config";
import { apiClient } from "@/lib/api";

export interface ReplyReviewPayload {
  reviewId: number;
  content: string;
}

const replyReview = async ({ reviewId, content }: ReplyReviewPayload) => {
  const response = await apiClient.post(`${API_URL_REVIEW}/${reviewId}/reply`, { content });
  return response.data;
};

export const useReplyReview = (
  config?: UseMutationOptions<any, Error, ReplyReviewPayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: replyReview,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seller", "reviews"] });
      await queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    ...config,
  });
};
