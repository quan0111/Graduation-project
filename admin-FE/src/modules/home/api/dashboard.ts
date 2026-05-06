import { useQuery } from "@tanstack/react-query";
import { API_URL_ADMIN } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { QueryConfig } from "@/lib/react-query";
import type { IDashboardStats } from "../types";

// ================= API =================
export const getDashboard = async (): Promise<IDashboardStats> => {
  const response = await apiClient.get(`${API_URL_ADMIN}/dashboard`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
    },
  });

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