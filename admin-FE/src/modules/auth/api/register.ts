import { API_URL_LOGIN } from "../../../constant/config";
import { apiClient } from "../../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RegisterRequest, AuthResponse } from "../types";
import type { MutationConfig } from "../../../lib/react-query";

// ================= API =================
export const Register = async (
  data: RegisterRequest
): Promise<AuthResponse> => {
  const response = await apiClient.post(
    `${API_URL_LOGIN}/register`,
    data,
    {
      withCredentials: true, // 🔥 để nhận cookie refresh_token
    }
  );

  return response.data;
};

// ================= HOOK =================
type UseRegisterOption = {
  config?: MutationConfig<typeof Register>;
};

export const useRegister = ({ config }: UseRegisterOption = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: Register,

    onSuccess: async (data) => {
      console.log("REGISTER DATA:", data);

      // 🔥 lưu access_token (đúng chức năng)
      if (data?.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }

      // 🔥 lưu user
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      await queryClient.invalidateQueries({
        queryKey: ["auth"],
      });
    },

    onError: (error: any) => {
      console.error("Register failed:", error?.message || error);
    },

    ...config,
  });
};