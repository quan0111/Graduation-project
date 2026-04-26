import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API_URL_PRODUCT } from "@/constant/config";
import type { QueryConfig } from "@/lib/react-query";
import type { IProduct } from "../types";

export const getProduct = async (id: number): Promise<IProduct> => {
  const res = await apiClient.get(`${API_URL_PRODUCT}/${id}`);
  return res.data;
};

type UseProductOptions = {
  id: number;
  config?: QueryConfig<typeof getProduct>;
};

export const useProduct = ({ id, config }: UseProductOptions) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: !!id,
    ...config,
  });
};