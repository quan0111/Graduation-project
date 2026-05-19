import { apiClient } from "../../../lib/api";
import { useQuery } from "@tanstack/react-query";
import type { MutationConfig } from "../../../lib/react-query";
import { API_URL_LOGIN } from "@/constant/config";
import { setStoredStorefrontUser } from "@/lib/auth-storage";
import { useAuthStore } from "@/stores/auth.store";
import type { IMe } from "../types";

// ===== API =====
export const getMe = async (): Promise<IMe> => {
  const response = await apiClient.get( `${API_URL_LOGIN}/me`,{
    withCredentials: true,
  });
  const user = response.data;
  if (user?.id) {
    setStoredStorefrontUser(user);
    useAuthStore.getState().setUser(user);
  }
  return response.data;
};


type UseMeOptions = {
  config?: MutationConfig<typeof getMe>;
};

export const useMe = ({ config }: UseMeOptions = {}) => {

  return useQuery({
    queryKey: ["auth"],
    queryFn: getMe,

    
    retry: false,


    staleTime: 1000 * 60 * 5,

    ...config,
  });
};
