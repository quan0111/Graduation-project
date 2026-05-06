import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";

import { mapOrder } from "./mapper";
import type { IOrder } from "../types";

const getSellerOrderById = async (id: number): Promise<IOrder> => {
  const res = await apiClient.get(`${API_URL_ORDER}/seller/${id}`);
  return mapOrder(res.data);
};

export const useGetSellerOrderById = (
  id: number,
  config?: Omit<
    UseQueryOptions<IOrder, Error, IOrder, [string, string, number]>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<IOrder, Error, IOrder, [string, string, number]>({
    queryKey: ["orders", "seller-detail", id],
    queryFn: () => getSellerOrderById(id),
    enabled: !!id,
    ...config,
  });
};
