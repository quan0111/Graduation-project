import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_URL_LOGIN } from "../../../constant/config";
import { saveStorefrontSession } from "@/lib/auth-storage";
import { mergeGuestCartToAccount } from "@/lib/guest-cart";
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
    onSuccess: async (data) => {
      saveStorefrontSession(data.access_token, data.user);
      await mergeGuestCartToAccount();
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      await queryClient.invalidateQueries({ queryKey: ["cart", data.user.id] });
    },
    ...config,
  });
};
