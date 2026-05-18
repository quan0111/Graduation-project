import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { API_URL_LOGIN } from "@/constant/config";
import { apiClient } from "@/lib/api";

type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};

const changePassword = async (payload: ChangePasswordPayload) => {
  const response = await apiClient.post(`${API_URL_LOGIN}/change-password`, {
    old_password: payload.oldPassword,
    new_password: payload.newPassword,
  });
  return response.data;
};

export const useChangePassword = (
  config?: UseMutationOptions<unknown, Error, ChangePasswordPayload>,
) => {
  return useMutation({
    mutationFn: changePassword,
    ...config,
  });
};
