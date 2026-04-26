import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export const getVariants = async (productId: number) => {
  const res = await apiClient.get(`/products/${productId}/variants`);
  return res.data;
};

export const useVariants = (productId: number) => {
  return useQuery({
    queryKey: ["variants", productId],
    queryFn: () => getVariants(productId),
    enabled: !!productId,
  });
};