import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { API_URL_PRODUCT } from "@/constant/config";
import { apiClient } from "@/lib/api";
const getProduct = async (): Promise<unknown[]> => {
  const response = await apiClient.get(API_URL_PRODUCT);
  return response.data;
};

export const useGetProduct = (
  config?: Omit<UseQueryOptions<unknown[], Error, unknown[], [string]>, "queryKey" | "queryFn">,
) => {
  return useQuery<unknown[], Error, unknown[], [string]>({
    queryKey: ["products"],
    queryFn: getProduct,
    ...config,
  });
};
