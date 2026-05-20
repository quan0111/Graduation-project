import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { API_URL_PRODUCT } from "@/constant/config";
import { apiClient } from "@/lib/api";

export type ProductQuery = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  category_id?: number;
};

const getProduct = async (params: ProductQuery = {}): Promise<unknown[]> => {
  const { categoryId, ...rest } = params;
  const response = await apiClient.get(API_URL_PRODUCT, {
    params: {
      ...rest,
      category_id: params.category_id ?? categoryId,
    },
  });
  return response.data;
};

export const useGetProduct = (
  params: ProductQuery = {},
  config?: Omit<UseQueryOptions<unknown[], Error, unknown[], [string, ProductQuery]>, "queryKey" | "queryFn">,
) => {
  return useQuery<unknown[], Error, unknown[], [string, ProductQuery]>({
    queryKey: ["products", params],
    queryFn: () => getProduct(params),
    ...config,
  });
};
