import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_URL_LOGIN } from "@/constant/config";
import { clearStorefrontSession } from "@/lib/auth-storage";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import { useAuthStore } from "@/stores/auth.store";

export const logout = async (): Promise<void> => {
  await apiClient.post(`${API_URL_LOGIN}/logout`, {});
};

type UseLogoutOptions = {
  config?: MutationConfig<typeof logout>;
};

export const useLogout = ({ config }: UseLogoutOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      clearStorefrontSession();
      useAuthStore.getState().setUser(null);
      await queryClient.clear();
      window.location.href = "/login";
    },
    ...config,
  });
};
