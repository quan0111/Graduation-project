import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_URL_FOLLOW } from "@/constant/config";
import { apiClient } from "@/lib/api";

const getIsFollowing = async (shopId: number): Promise<boolean> => {
  const response = await apiClient.get(`${API_URL_FOLLOW}/is-following/${shopId}`);
  return Boolean(response.data?.is_following);
};

const getFollowerCount = async (shopId: number): Promise<number> => {
  const response = await apiClient.get(`${API_URL_FOLLOW}/shop/${shopId}/count`);
  return Number(response.data?.followers || 0);
};

const followShop = async (shopId: number) => {
  const response = await apiClient.post(`${API_URL_FOLLOW}/${shopId}`);
  return response.data;
};

const unfollowShop = async (shopId: number) => {
  const response = await apiClient.delete(`${API_URL_FOLLOW}/${shopId}`);
  return response.data;
};

export const useIsFollowingShop = (shopId: number, enabled = true) => {
  return useQuery({
    queryKey: ["shop-follow", "is-following", shopId],
    queryFn: () => getIsFollowing(shopId),
    enabled: enabled && Number.isFinite(shopId) && shopId > 0,
  });
};

export const useShopFollowerCount = (shopId: number) => {
  return useQuery({
    queryKey: ["shop-follow", "count", shopId],
    queryFn: () => getFollowerCount(shopId),
    enabled: Number.isFinite(shopId) && shopId > 0,
  });
};

export const useFollowShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followShop,
    onSuccess: async (_data, shopId) => {
      await queryClient.invalidateQueries({ queryKey: ["shop-follow", "is-following", shopId] });
      await queryClient.invalidateQueries({ queryKey: ["shop-follow", "count", shopId] });
    },
  });
};

export const useUnfollowShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfollowShop,
    onSuccess: async (_data, shopId) => {
      await queryClient.invalidateQueries({ queryKey: ["shop-follow", "is-following", shopId] });
      await queryClient.invalidateQueries({ queryKey: ["shop-follow", "count", shopId] });
    },
  });
};
