import { apiClient } from "../../../lib/api";
import { useMutation } from "@tanstack/react-query";
import type { MutationConfig } from "../../../lib/react-query";

export const Logout = async () => {
  const res = await apiClient.post("/auth/logout", {}, {
    withCredentials: true,
  });
  return res.data;
};

export const useLogout = (config?: MutationConfig<typeof Logout>) => {
  return useMutation({
    mutationFn: Logout,

    onSuccess: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    },

    ...config,
  });
};