import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";

import { mapOrder } from "./mapper";
import type { IOrder } from "../types";

export type UpdateOrderDto = Partial<Pick<IOrder, "status">>;

const toApiPayload = (data: UpdateOrderDto) => ({
  status: data.status?.toUpperCase(),
});

const updateOrder = async (id: string, data: UpdateOrderDto): Promise<IOrder> => {
  try {
    const res = await apiClient.patch(`${API_URL_ORDER}/${id}`, toApiPayload(data));
    return mapOrder(res.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      const detail = error.response?.data?.detail;
      if (typeof detail === "string") {
        throw new Error(detail);
      }
    }
    throw error;
  }
};

const confirmPackageReceived = async (orderId: number, packageId: number): Promise<IOrder> => {
  try {
    const res = await apiClient.patch(`${API_URL_ORDER}/${orderId}/packages/${packageId}/complete`);
    return mapOrder(res.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      const detail = error.response?.data?.detail;
      if (typeof detail === "string") {
        throw new Error(detail);
      }
    }
    throw error;
  }
};

export const useUpdateOrder = (
  config?: UseMutationOptions<IOrder, Error, { id: string; data: UpdateOrderDto }>,
) => {
  return useMutation({
    mutationFn: ({ id, data }) => updateOrder(id, data),
    ...config,
  });
};

export const useConfirmPackageReceived = (
  config?: UseMutationOptions<IOrder, Error, { orderId: number; packageId: number }>,
) => {
  return useMutation({
    mutationFn: ({ orderId, packageId }) => confirmPackageReceived(orderId, packageId),
    ...config,
  });
};
