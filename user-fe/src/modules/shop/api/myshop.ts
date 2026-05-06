import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL_SHOP } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

export interface Shop {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    avatarUrl?: string;
    ownerId: number;
    createdAt: string;
    updatedAt: string;
    followerCount?: number;
    productCount?: number;
    isFollowing?: boolean;
}

export interface CreateShopRequest {
    name: string;
    description?: string;
    slug?: string;
}

export interface UpdateShopRequest {
    name?: string;
    slug?: string;
    description?: string;
    avatarUrl?: string;
}
export const getShopByOwnerId = async (): Promise<Shop> => {
  const response = await apiClient.get(`${API_URL_SHOP}/me`);
  return response.data;
};

export const useGetShopByOwnerId = (
  config?: Omit<UseQueryOptions<Shop, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<Shop, Error>({
    queryKey: ["shop", "my-shop"],
    queryFn: getShopByOwnerId,
    ...config,
  });
};

export const updateMyShop = async (data: UpdateShopRequest): Promise<Shop> => {
  const response = await apiClient.patch(`${API_URL_SHOP}/me`, data);
  return response.data;
};

export const useUpdateMyShop = ({ config }: { config?: MutationConfig<typeof updateMyShop> } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyShop,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shop", "my-shop"] });
    },
    ...config,
  });
};
