import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";

import { mapOrder } from "./mapper";
import type { IOrder } from "../types";

export type UpdateOrderDto = Partial<Pick<IOrder, "status">>;

const toApiPayload = (data: UpdateOrderDto) => ({
  status: data.status?.toUpperCase(),
});

const updateOrder = async (id: string, data: UpdateOrderDto): Promise<IOrder> => {
  const res = await apiClient.patch(`${API_URL_ORDER}/${id}`, toApiPayload(data));
  return mapOrder(res.data);
};

export const useUpdateOrder = (
  config?: UseMutationOptions<IOrder, Error, { id: string; data: UpdateOrderDto }>,
) => {
  return useMutation({
    mutationFn: ({ id, data }) => updateOrder(id, data),
    ...config,
  });
};
