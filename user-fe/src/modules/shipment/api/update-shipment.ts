import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { API_URL_SHIPMENT } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { Shipment } from "./get-shipment";

export interface ShipmentUpdatePayload {
  status?: string;
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

const updateShipment = async (
  orderId: number,
  payload: ShipmentUpdatePayload,
): Promise<Shipment> => {
  const response = await apiClient.patch(`${API_URL_SHIPMENT}/order/${orderId}`, payload);
  return response.data;
};

export const useUpdateShipment = (
  config?: UseMutationOptions<Shipment, Error, { orderId: number; payload: ShipmentUpdatePayload }>,
) => {
  return useMutation({
    mutationFn: ({ orderId, payload }) => updateShipment(orderId, payload),
    ...config,
  });
};
