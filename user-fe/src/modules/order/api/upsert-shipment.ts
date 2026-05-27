import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_URL_SHIPMENT } from "@/constant/config";
import { apiClient } from "@/lib/api";

import type { IShipment, ShipmentStatusType } from "../types";

type ShipmentPayload = {
  orderId: number;
  carrier?: string;
  trackingNumber?: string;
  status?: ShipmentStatusType;
  hasExisting: boolean;
};

const normalizeStatus = (status?: ShipmentStatusType) =>
  status ? status.toUpperCase() : undefined;

const mapShipment = (shipment: any): IShipment => ({
  id: shipment.id,
  order_id: shipment.orderId,
  carrier: shipment.carrier ?? null,
  tracking_number: shipment.trackingNumber ?? null,
  status: shipment.status.toLowerCase() as ShipmentStatusType,
  shipped_at: shipment.shippedAt ?? null,
  delivered_at: shipment.deliveredAt ?? null,
  created_at: shipment.createdAt,
});

const isShipmentNotFound = (error: any) =>
  error?.response?.status === 404 && error?.response?.data?.detail === "Shipment not found";

const createShipment = async (orderId: number, carrier?: string, trackingNumber?: string): Promise<IShipment> => {
  const response = await apiClient.post(API_URL_SHIPMENT, {
    orderId,
    carrier,
    trackingNumber,
  });

  return mapShipment(response.data);
};

const patchShipment = async (
  orderId: number,
  carrier?: string,
  trackingNumber?: string,
  status?: ShipmentStatusType,
): Promise<IShipment> => {
  const response = await apiClient.patch(`${API_URL_SHIPMENT}/order/${orderId}`, {
    carrier,
    trackingNumber,
    status: normalizeStatus(status),
  });

  return mapShipment(response.data);
};

const upsertShipment = async ({
  orderId,
  carrier,
  trackingNumber,
  status,
  hasExisting,
}: ShipmentPayload): Promise<IShipment> => {
  if (!hasExisting) {
    const createdShipment = await createShipment(orderId, carrier, trackingNumber);

    if (!status || status === "ready_to_ship") {
      return createdShipment;
    }
  }

  try {
    return await patchShipment(orderId, carrier, trackingNumber, status);
  } catch (error: any) {
    if (!isShipmentNotFound(error)) {
      throw error;
    }

    const createdShipment = await createShipment(orderId, carrier, trackingNumber);
    if (!status || status === "ready_to_ship") {
      return createdShipment;
    }

    return await patchShipment(orderId, carrier, trackingNumber, status);
  }
};

export const useUpsertShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertShipment,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["orders", "seller-detail", variables.orderId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["orders", "seller"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["orders", "detail", variables.orderId],
        }),
      ]);
    },
  });
};
