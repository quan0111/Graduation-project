import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_URL_LOGIN } from "../../../constant/config";
import { saveStorefrontSession } from "@/lib/auth-storage";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { AuthResponse, IAuth } from "../types";

export const login = async (data: IAuth): Promise<AuthResponse> => {
  const response = await apiClient.post(`${API_URL_LOGIN}/login`, data);
  return response.data;
};

type UseLoginOption = {
  config?: MutationConfig<typeof login>;
};

export const useLogin = ({ config }: UseLoginOption = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      saveStorefrontSession(data.access_token, data.user);
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    ...config,
  });
};
