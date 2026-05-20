import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";

import { API_URL_WISHLIST } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { IProduct } from "@/modules/product/types";

export interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt?: string;
  product?: IProduct;
}

const getWishlist = async (): Promise<WishlistItem[]> => {
  const response = await apiClient.get(`${API_URL_WISHLIST}/`);
  return response.data;
};

const addToWishlist = async (productId: number): Promise<WishlistItem> => {
  const response = await apiClient.post(`${API_URL_WISHLIST}/${productId}`);
  return response.data;
};

const removeFromWishlist = async (productId: number): Promise<void> => {
  await apiClient.delete(`${API_URL_WISHLIST}/${productId}`);
};

export const useWishlist = (
  config?: Omit<UseQueryOptions<WishlistItem[], Error>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
    staleTime: 30_000,
    ...config,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToWishlist,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};
