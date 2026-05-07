import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { API_URL_SHIPMENT } from "@/constant/config";
import { apiClient } from "@/lib/api";

export interface Shipment {
  id: number;
  orderId: number;
  carrier: string | null;
  trackingNumber: string | null;
  status: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

const getShipmentByOrder = async (orderId: number): Promise<Shipment> => {
  const response = await apiClient.get(`${API_URL_SHIPMENT}/order/${orderId}`);
  return response.data;
};

export const useShipmentByOrder = (
  orderId: number,
  config?: UseQueryOptions<Shipment, Error>,
) => {
  return useQuery({
    queryKey: ["shipment", "order", orderId],
    queryFn: () => getShipmentByOrder(orderId),
    ...config,
  });
};
