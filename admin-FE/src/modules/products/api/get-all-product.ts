import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API_URL_PRODUCT } from "@/constant/config";
import type { QueryConfig } from "@/lib/react-query";
import type { IProduct } from "../types";

export const getProducts = async (): Promise<IProduct[]> => {
  const res = await apiClient.get(`${API_URL_PRODUCT}`, { params: { limit: 100 } });
  return res.data;
};

type UseProductsOptions = {
  config?: QueryConfig<typeof getProducts>;
};

export const useProducts = ({ config }: UseProductsOptions = {}) => {
  return useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    ...config,
  });
};
