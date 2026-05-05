import { apiClient } from "../../../lib/api";
import { useQuery } from "@tanstack/react-query";
import type { MutationConfig } from "../../../lib/react-query";
import { API_URL_LOGIN } from "@/constant/config";
import type { IMe } from "../types";

// ===== API =====
export const getMe = async (): Promise<IMe> => {
  const response = await apiClient.get( `${API_URL_LOGIN}/me`);
  return response.data;
};

// ===== HOOK =====
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