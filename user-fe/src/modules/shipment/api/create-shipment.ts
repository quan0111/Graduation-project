import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { API_URL_SHIPMENT } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { Shipment } from "./get-shipment";

export interface ShipmentCreatePayload {
  orderId: number;
  carrier?: string;
  trackingNumber?: string;
}

const createShipment = async (payload: ShipmentCreatePayload): Promise<Shipment> => {
  const response = await apiClient.post(`${API_URL_SHIPMENT}/`, payload);
  return response.data;
};

export const useCreateShipment = (
  config?: UseMutationOptions<Shipment, Error, ShipmentCreatePayload>,
) => {
  return useMutation({
    mutationFn: createShipment,
    ...config,
  });
};
