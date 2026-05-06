import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";

import { mapOrder } from "./mapper";
import type { IOrder } from "../types";

const getOrderById = async (id: number): Promise<IOrder> => {
  const res = await apiClient.get(`${API_URL_ORDER}/${id}`);
  return mapOrder(res.data);
};

export const useGetOrderById = (
  id: number,
  config?: Omit<
    UseQueryOptions<IOrder, Error, IOrder, [string, string, number]>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<IOrder, Error, IOrder, [string, string, number]>({
    queryKey: ["orders", "detail", id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
    ...config,
  });
};
