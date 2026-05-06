import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { ISellerApplication } from "../types/seller";

export const getMySeller = async (): Promise<ISellerApplication> => {
  const res = await apiClient.get(`/seller/me`);
  return res.data;
};

export const useGetMySeller = (enabled = true) => {
  return useQuery({
    queryKey: ["seller", "me"],
    queryFn: () => getMySeller(),
    enabled,
    retry: false,
  });
};
