import { useQuery } from "@tanstack/react-query";
import { API_URL_ADMIN } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { QueryConfig } from "@/lib/react-query";
import type { IOrder } from "../types";

export const getAllOrders = async (): Promise<IOrder[]> => {
  const res = await apiClient.post(`${API_URL_ADMIN}/orders`, {
    filter_data: {},
    pagination: { page: 1, limit: 1000 }
  });
  return res.data.data || res.data;
};

type UseGetAllOrdersOptions = {
  config?: QueryConfig<typeof getAllOrders>;
};

export const useGetAllOrders = ({
  config,
}: UseGetAllOrdersOptions = {}) => {
  return useQuery<IOrder[]>({
    queryKey: ["orders"],
    queryFn: getAllOrders,
    ...config,
  });
};
