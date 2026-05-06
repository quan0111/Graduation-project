import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { ISellerApplication } from "../types/seller";

export const getMySeller = async (
  userId: number
): Promise<ISellerApplication> => {
  const res = await apiClient.get(`/seller/me/${userId}`);
  return res.data;
};

export const useGetMySeller = (userId: number) => {
  return useQuery({
    queryKey: ["seller", "me", userId],
    queryFn: () => getMySeller(userId),
    enabled: !!userId,
  });
};