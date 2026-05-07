import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { API_URL_SHIPMENT } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { Shipment } from "./get-shipment";

const getAllShipments = async (): Promise<Shipment[]> => {
  const response = await apiClient.get(`${API_URL_SHIPMENT}/`);
  return response.data;
};

export const useAllShipments = (
  config?: UseQueryOptions<Shipment[], Error>,
) => {
  return useQuery({
    queryKey: ["shipments", "all"],
    queryFn: getAllShipments,
    ...config,
  });
};
