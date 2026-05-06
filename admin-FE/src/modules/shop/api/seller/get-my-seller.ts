import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { QueryConfig } from "@/lib/react-query";

export const getMySeller = async (user_id: number) => {
  const res = await apiClient.get(`/seller/me/${user_id}`);
  return res.data;
};

type UseGetMySellerOptions = {
  user_id: number;
  config?: QueryConfig<typeof getMySeller>;
};

export const useGetMySeller = ({
  user_id,
  config,
}: UseGetMySellerOptions) => {
  return useQuery({
    queryKey: ["seller", "me", user_id],
    queryFn: () => getMySeller(user_id),
    enabled: !!user_id,
    ...config,
  });
};