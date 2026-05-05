import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { AuthResponse } from "../types";

export const refreshToken = async (token: string): Promise<AuthResponse> => {
  const response = await apiClient.post(`/auth/refresh`, {
    refresh_token: token, // 🔥 đúng format backend
  });

  return response.data;
};

type UseRefreshTokenOptions = {
  config?: MutationConfig<typeof refreshToken>;
};

export const useRefreshToken = ({ config }: UseRefreshTokenOptions = {}) => {
  return useMutation({
    mutationFn: refreshToken,

    onSuccess: (data) => {
      if (data?.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }

      if (data?.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
    },

    ...config,
  });
};