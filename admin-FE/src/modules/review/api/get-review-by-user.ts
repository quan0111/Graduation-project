import { useQuery } from "@tanstack/react-query";
import { API_URL_REVIEW } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { QueryConfig } from "@/lib/react-query";
import type { IReview } from "../types";

export const getReviewsByUser = async (
  userId: number
): Promise<IReview[]> => {
  const res = await apiClient.get(`${API_URL_REVIEW}/user/${userId}`);
  return res.data;
};

type UseGetReviewsByUserOptions = {
  userId: number;
  config?: QueryConfig<typeof getReviewsByUser>;
};

export const useGetReviewsByUser = ({
  userId,
  config,
}: UseGetReviewsByUserOptions) => {
  return useQuery<IReview[]>({
    queryKey: ["reviews", "user", userId],
    queryFn: () => getReviewsByUser(userId),
    enabled: !!userId,
    ...config,
  });
};