import { useQuery } from "@tanstack/react-query";
import { API_URL_REVIEW } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { QueryConfig } from "@/lib/react-query";

export interface IReviewStats {
  average: number;
  total: number;
  ratings: Record<number, number>;
}

export const getReviewStats = async (
  productId: number
): Promise<IReviewStats> => {
  const res = await apiClient.get(
    `${API_URL_REVIEW}/product/${productId}/stats`
  );
  return res.data;
};

type UseGetReviewStatsOptions = {
  productId: number;
  config?: QueryConfig<typeof getReviewStats>;
};

export const useGetReviewStats = ({
  productId,
  config,
}: UseGetReviewStatsOptions) => {
  return useQuery<IReviewStats>({
    queryKey: ["review-stats", productId],
    queryFn: () => getReviewStats(productId),
    enabled: !!productId,
    ...config,
  });
};