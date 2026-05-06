import { useQuery } from "@tanstack/react-query";

import { API_URL_ADMIN } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { QueryConfig } from "@/lib/react-query";
import type { IDashboardStats } from "../types";

export const getDashboard = async (): Promise<IDashboardStats> => {
  const response = await apiClient.get(`${API_URL_ADMIN}/dashboard`);
  return response.data;
};

type UseDashboardOptions = {
  config?: QueryConfig<typeof getDashboard>;
};

export const useDashboard = ({ config }: UseDashboardOptions = {}) => {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboard,
    ...config,
  });
};
