import { useQuery } from "@tanstack/react-query";

import { API_URL_FLASH_SALE } from "@/constant/config";
import { apiClient } from "@/lib/api";

export type ActiveFlashSaleItem = {
  id: number;
  flashSaleId: number;
  productId: number;
  variantId?: number | null;
  shopId: number;
  salePrice: number;
  stockLimit?: number | null;
  soldCount: number;
  purchaseLimit?: number | null;
  createdAt: string;
  product: Record<string, unknown>;
  variant?: Record<string, unknown> | null;
  shop?: Record<string, unknown> | null;
};

export type ActiveFlashSale = {
  id: number;
  name: string;
  startsAt: string;
  endsAt: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: ActiveFlashSaleItem[];
};

export const useActiveFlashSales = () => {
  return useQuery({
    queryKey: ["flash-sales", "active"],
    queryFn: async () => {
      const response = await apiClient.get<ActiveFlashSale[]>(`${API_URL_FLASH_SALE}/active`);
      return response.data;
    },
    staleTime: 30_000,
  });
};
