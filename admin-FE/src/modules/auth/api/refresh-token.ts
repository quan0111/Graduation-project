import { useMutation } from "@tanstack/react-query";
import { API_URL_LOGIN } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { AuthResponse } from "../types";

export const refreshToken = async (): Promise<AuthResponse> => {
  const response = await apiClient.post(
    `${API_URL_LOGIN}/refresh`,
    {},
    {
      withCredentials: true, // 🔥 bắt buộc để gửi cookie
    }
  );

  return response.data;
};

// ================= HOOK =================
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
    },

    onError: (error) => {
      console.error("Refresh token error:", error);
    },

    ...config,
  });
};