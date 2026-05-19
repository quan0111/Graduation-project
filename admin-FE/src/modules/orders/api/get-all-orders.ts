import { useQuery } from "@tanstack/react-query";
import { API_URL_ADMIN } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { QueryConfig } from "@/lib/react-query";
import type { IOrder } from "../types";

export type OrdersPageResponse = {
  data: IOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const getAllOrders = async ({
  page = 1,
  limit = 20,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<OrdersPageResponse> => {
  const res = await apiClient.post(`${API_URL_ADMIN}/orders`, {
    filter_data: {},
    pagination: { page, limit, search: search || undefined }
  });
  if (Array.isArray(res.data)) {
    return {
      data: res.data,
      pagination: { page, limit, total: res.data.length, totalPages: 1 },
    };
  }
  return {
    data: res.data.data || [],
    pagination: res.data.pagination || { page, limit, total: 0, totalPages: 1 },
  };
};

type UseGetAllOrdersOptions = {
  config?: QueryConfig<typeof getAllOrders>;
};

export const useGetAllOrders = ({
  page = 1,
  limit = 20,
  search = "",
  config,
}: UseGetAllOrdersOptions & { page?: number; limit?: number; search?: string } = {}) => {
  return useQuery<OrdersPageResponse>({
    queryKey: ["orders", page, limit, search],
    queryFn: () => getAllOrders({ page, limit, search }),
    ...config,
  });
};
