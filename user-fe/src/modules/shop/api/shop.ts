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
    id: number;
    name?: string;
    description?: string;
    avatarUrl?: string;
}

// Get all shops
export const getShops = async (): Promise<Shop[]> => {
    const response = await apiClient.get(API_URL_SHOP);
    return response.data;
};

export const useGetShops = (
    config?: Omit<UseQueryOptions<Shop[], Error>, "queryKey" | "queryFn">
) => {
    return useQuery<Shop[], Error>({
        queryKey: ["shops"],
        queryFn: getShops,
        ...config,
    });
};

// Get shop by ID
export const getShopById = async (id: number): Promise<Shop> => {
    const response = await apiClient.get(`${API_URL_SHOP}/${id}`);
    return response.data;
};

export const useGetShopById = (
    id: number,
    config?: Omit<UseQueryOptions<Shop, Error>, "queryKey" | "queryFn">
) => {
    return useQuery<Shop, Error>({
        queryKey: ["shop", id],
        queryFn: () => getShopById(id),
        ...config,
    });
};

// Get shop by slug
export const getShopBySlug = async (slug: string): Promise<Shop> => {
    const response = await apiClient.get(`${API_URL_SHOP}/slug/${slug}`);
    return response.data;
};

export const useGetShopBySlug = (
    slug: string,
    config?: Omit<UseQueryOptions<Shop, Error>, "queryKey" | "queryFn">
) => {
    return useQuery<Shop, Error>({
        queryKey: ["shop", slug],
        queryFn: () => getShopBySlug(slug),
        ...config,
    });
};

// Get shop products
export const getShopProducts = async (shopId: number): Promise<any[]> => {
    const response = await apiClient.get(`${API_URL_SHOP}/${shopId}/products`);
    return response.data;
};

export const useGetShopProducts = (
    shopId: number,
    config?: Omit<UseQueryOptions<any[], Error>, "queryKey" | "queryFn">
) => {
    return useQuery<any[], Error>({
        queryKey: ["shop", shopId, "products"],
        queryFn: () => getShopProducts(shopId),
        ...config,
    });
};

// Follow shop
export const followShop = async (shopId: number): Promise<void> => {
    await apiClient.post(`${API_URL_SHOP}/follow`, { shopId });
};

export const useFollowShop = ({ config }: { config?: MutationConfig<typeof followShop> } = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: followShop,
        onSuccess: async (_, shopId) => {
            await queryClient.invalidateQueries({ queryKey: ["shop", shopId] });
            await queryClient.invalidateQueries({ queryKey: ["shops"] });
        },
        ...config,
    });
};

// Unfollow shop
export const unfollowShop = async (shopId: number): Promise<void> => {
    await apiClient.delete(`${API_URL_SHOP}/follow/${shopId}`);
};

export const useUnfollowShop = ({ config }: { config?: MutationConfig<typeof unfollowShop> } = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: unfollowShop,
        onSuccess: async (_, shopId) => {
            await queryClient.invalidateQueries({ queryKey: ["shop", shopId] });
            await queryClient.invalidateQueries({ queryKey: ["shops"] });
        },
        ...config,
    });
};

// Get followed shops
export const getFollowedShops = async (): Promise<Shop[]> => {
  const response = await apiClient.get(`${API_URL_SHOP}/following`);
  return response.data;
};

export const useGetFollowedShops = (
  config?: Omit<UseQueryOptions<Shop[], Error>, "queryKey" | "queryFn">
) => {
  return useQuery<Shop[], Error>({
    queryKey: ["shops", "following"],
    queryFn: getFollowedShops,
    ...config,
  });
};

// Get shop by owner ID (current user's shop)
export const getShopByOwnerId = async (): Promise<Shop> => {
  const response = await apiClient.get(`${API_URL_SHOP}/my-shop`);
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
