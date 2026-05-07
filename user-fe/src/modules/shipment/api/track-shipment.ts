import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { API_URL_SHIPMENT } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { Shipment } from "./get-shipment";

const trackShipment = async (trackingNumber: string): Promise<Shipment> => {
  const response = await apiClient.get(`${API_URL_SHIPMENT}/track/${trackingNumber}`);
  return response.data;
};

export const useTrackShipment = (
  trackingNumber: string,
  config?: UseQueryOptions<Shipment, Error>,
) => {
  return useQuery({
    queryKey: ["shipment", "track", trackingNumber],
    queryFn: () => trackShipment(trackingNumber),
    ...config,
  });
};
