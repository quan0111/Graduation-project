import { apiClient } from "../../../lib/api";
import { useMutation } from "@tanstack/react-query";
import type { MutationConfig } from "../../../lib/react-query";

type Payload = {
  old_password: string;
  new_password: string;
};

export const ChangePassword = async (data: Payload) => {
  const res = await apiClient.post("/auth/change-password", data, {
    withCredentials: true,
  });
  return res.data;
};

export const useChangePassword = (
  config?: MutationConfig<typeof ChangePassword>
) => {
  return useMutation({
    mutationFn: ChangePassword,
    ...config,
  });
};