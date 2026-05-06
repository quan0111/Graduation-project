import { useMutation } from "@tanstack/react-query";

import { API_URL_LOGIN } from "@/constant/config";
import { setAdminAccessToken } from "@/lib/auth-storage";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { RefreshTokenResponse } from "../types";

export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post(`${API_URL_LOGIN}/admin/refresh`, {});
  return response.data;
};

type UseRefreshTokenOptions = {
  config?: MutationConfig<typeof refreshToken>;
};

export const useRefreshToken = ({ config }: UseRefreshTokenOptions = {}) => {
  return useMutation({
    mutationFn: refreshToken,
    onSuccess: (data) => {
      setAdminAccessToken(data.access_token);
    },
    ...config,
  });
};
