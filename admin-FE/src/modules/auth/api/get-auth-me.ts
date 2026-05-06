import { useQuery } from "@tanstack/react-query";

import { API_URL_LOGIN } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { QueryConfig } from "../../../lib/react-query";
import type { AuthUser } from "../types";

export const getMe = async (): Promise<AuthUser> => {
  const response = await apiClient.get(`${API_URL_LOGIN}/admin/me`);
  return response.data;
};

type UseMeOptions = {
  config?: QueryConfig<typeof getMe>;
};

export const useMe = ({ config }: UseMeOptions = {}) => {
  return useQuery({
    queryKey: ["auth"],
    queryFn: getMe,
    retry: false,
    staleTime: 1000 * 60 * 5,
    ...config,
  });
};
