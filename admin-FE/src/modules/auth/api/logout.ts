import { useMutation } from "@tanstack/react-query";

import { API_URL_LOGIN } from "@/constant/config";
import { clearAdminSession } from "@/lib/auth-storage";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";

export const logout = async () => {
  const response = await apiClient.post(`${API_URL_LOGIN}/admin/logout`, {});
  return response.data;
};

export const useLogout = (config?: MutationConfig<typeof logout>) => {
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAdminSession();
      window.location.href = "/admin/login";
    },
    ...config,
  });
};
