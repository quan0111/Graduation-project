import { useQuery } from "@tanstack/react-query";
import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { QueryConfig } from "@/lib/react-query";
import type { IOrder } from "../types";

export const getAllOrders = async (): Promise<IOrder[]> => {
  const res = await apiClient.get(`${API_URL_ORDER}`);
  return res.data;
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