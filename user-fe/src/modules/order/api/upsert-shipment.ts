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

const upsertShipment = async ({
  orderId,
  carrier,
  trackingNumber,
  status,
  hasExisting,
}: ShipmentPayload): Promise<IShipment> => {
  if (!hasExisting) {
    const createRes = await apiClient.post(API_URL_SHIPMENT, {
      orderId,
      carrier,
      trackingNumber,
    });

    if (!status || status === "processing" || status === "ready_to_ship") {
      return mapShipment(createRes.data);
    }
  }

  const patchRes = await apiClient.patch(`${API_URL_SHIPMENT}/order/${orderId}`, {
    carrier,
    trackingNumber,
    status: normalizeStatus(status),
  });

  return mapShipment(patchRes.data);
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
