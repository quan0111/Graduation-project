import { useQuery } from "@tanstack/react-query";
import { API_URL_REVIEW } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { QueryConfig } from "@/lib/react-query";
import type { IReview } from "../types";

// ================= API =================
export const searchReviews = async (
  productId: number,
  keyword: string
): Promise<IReview[]> => {
  const res = await apiClient.get(
    `${API_URL_REVIEW}/product/${productId}/search`,
    {
      params: { keyword },
    }
  );
  return res.data;
};

// ================= OPTIONS =================
type UseSearchReviewsOptions = {
  productId: number;
  keyword: string;
  config?: QueryConfig<typeof searchReviews>;
};

// ================= HOOK =================
export const useSearchReviews = ({
  productId,
  keyword,
  config,
}: UseSearchReviewsOptions) => {
  return useQuery<IReview[]>({
    queryKey: ["reviews", productId, keyword],
    queryFn: () => searchReviews(productId, keyword),
    enabled: !!productId && !!keyword,
    ...config,
  });
};