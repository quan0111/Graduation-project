import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";

import { mapOrder } from "./mapper";
import type { IOrder } from "../types";

const getSellerOrders = async (): Promise<IOrder[]> => {
  const res = await apiClient.get(`${API_URL_ORDER}/seller`);
  return Array.isArray(res.data) ? res.data.map(mapOrder) : [];
};

export const useGetSellerOrders = (
  config?: Omit<
    UseQueryOptions<IOrder[], Error, IOrder[], [string, string]>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<IOrder[], Error, IOrder[], [string, string]>({
    queryKey: ["orders", "seller"],
    queryFn: getSellerOrders,
    ...config,
  });
};
