import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_URL_LOGIN } from "../../../constant/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { AuthResponse, RegisterRequest } from "../types";

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post(`${API_URL_LOGIN}/register`, data);
  return response.data;
};

type UseRegisterOption = {
  config?: MutationConfig<typeof register>;
};

export const useRegister = ({ config }: UseRegisterOption = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: register,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    ...config,
  });
};
