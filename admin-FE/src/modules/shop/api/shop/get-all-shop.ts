import { useQuery } from "@tanstack/react-query";
import { API_URL_SHOP } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { QueryConfig } from "@/lib/react-query";
import type { IShop } from "@/modules/shop/types";

export const getAllShop = async (): Promise<IShop[]> => {
  const res = await apiClient.get(API_URL_SHOP);
  return res.data;
};

type UseGetAllShopOptions = {
  config?: QueryConfig<typeof getAllShop>;
};

export const useGetAllShop = ({ config }: UseGetAllShopOptions = {}) => {
  return useQuery({
    queryKey: ["shops"],
    queryFn: getAllShop,
    ...config,
  });
};