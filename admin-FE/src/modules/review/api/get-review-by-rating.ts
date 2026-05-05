import { useQuery } from "@tanstack/react-query";
import { API_URL_REVIEW } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { QueryConfig } from "@/lib/react-query";
import type { IReview } from "../types";

// ================= API =================
export const getReviewsByRating = async (
  productId: number,
  minRating: number
): Promise<IReview[]> => {
  const res = await apiClient.get(
    `${API_URL_REVIEW}/product/${productId}/rating`,
    {
      params: { min_rating: minRating },
    }
  );
  return res.data;
};

// ================= OPTIONS =================
type UseGetReviewsByRatingOptions = {
  productId: number;
  minRating: number;
  config?: QueryConfig<typeof getReviewsByRating>;
};

// ================= HOOK =================
export const useGetReviewsByRating = ({
  productId,
  minRating,
  config,
}: UseGetReviewsByRatingOptions) => {
  return useQuery<IReview[]>({
    queryKey: ["reviews", productId, minRating],
    queryFn: () => getReviewsByRating(productId, minRating),
    enabled: !!productId,
    ...config,
  });
};