import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_URL_ADMIN } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig, QueryConfig } from "@/lib/react-query";

export interface AdminAccount {
  id: number;
  email: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminAccountRequest {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}

export const getAdminAccounts = async (): Promise<AdminAccount[]> => {
  const response = await apiClient.get(`${API_URL_ADMIN}/admin-users`);
  return response.data;
};

export const useAdminAccounts = ({ config }: { config?: QueryConfig<typeof getAdminAccounts> } = {}) => {
  return useQuery({
    queryKey: ["admin", "accounts"],
    queryFn: getAdminAccounts,
    ...config,
  });
};

export const createAdminAccount = async (data: CreateAdminAccountRequest): Promise<AdminAccount> => {
  const response = await apiClient.post(`${API_URL_ADMIN}/admin-users`, data);
  return response.data;
};

export const useCreateAdminAccount = ({ config }: { config?: MutationConfig<typeof createAdminAccount> } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminAccount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "accounts"] });
    },
    ...config,
  });
};
