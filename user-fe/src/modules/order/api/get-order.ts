import { API_URL_ORDER } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { IOrder } from "../types";
import { apiClient } from "@/lib/api";

interface OrderResponse {
  data: IOrder;
  error: boolean;
  message: string;
  timestamp: string;
}

const getOrderById = async (id: number): Promise<OrderResponse> => {
  const res = await apiClient.get(`${API_URL_ORDER}/${id}`);
  return res.data;
};

export const useGetOrderById = (
  id: number,
  config?: Omit<
    UseQueryOptions<OrderResponse, Error, OrderResponse, ["order", number]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
    ...config,
  });
};