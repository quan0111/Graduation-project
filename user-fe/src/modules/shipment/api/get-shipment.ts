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

export interface ShipmentEvent {
  id: number;
  orderId: number;
  shipmentId?: number | null;
  status: string;
  message?: string | null;
  location?: string | null;
  occurredAt?: string;
  createdAt?: string;
}

const getShipmentByOrder = async (orderId: number): Promise<Shipment | null> => {
  try {
    const response = await apiClient.get(`${API_URL_SHIPMENT}/order/${orderId}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

const getShipmentEventsByOrder = async (orderId: number): Promise<ShipmentEvent[]> => {
  const response = await apiClient.get(`${API_URL_SHIPMENT}/order/${orderId}/events`);
  return response.data;
};

export const useShipmentByOrder = (
  orderId: number,
  config?: Omit<UseQueryOptions<Shipment | null, Error>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: ["shipment", "order", orderId],
    queryFn: () => getShipmentByOrder(orderId),
    ...config,
  });
};

export const useShipmentEventsByOrder = (
  orderId: number,
  config?: Omit<UseQueryOptions<ShipmentEvent[], Error>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: ["shipment", "order", orderId, "events"],
    queryFn: () => getShipmentEventsByOrder(orderId),
    enabled: Boolean(orderId) && (config?.enabled ?? true),
    ...config,
  });
};
