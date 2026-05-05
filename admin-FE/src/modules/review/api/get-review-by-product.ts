import { useQuery } from "@tanstack/react-query";
import { API_URL_REVIEW } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { QueryConfig } from "@/lib/react-query";
import type { IReview } from "../types";

// ================= API =================
export const getReviewsByProduct = async (
  productId: number
): Promise<IReview[]> => {
  const res = await apiClient.get(
    `${API_URL_REVIEW}/product/${productId}`
  );
  return res.data;
};

// ================= OPTIONS =================
type UseGetReviewsByProductOptions = {
  productId: number;
  config?: QueryConfig<typeof getReviewsByProduct>;
};

// ================= HOOK =================
export const useGetReviewsByProduct = ({
  productId,
  config,
}: UseGetReviewsByProductOptions) => {
  return useQuery<IReview[]>({
    queryKey: ["reviews", productId],
    queryFn: () => getReviewsByProduct(productId),
    enabled: !!productId,
    ...config,
  });
};