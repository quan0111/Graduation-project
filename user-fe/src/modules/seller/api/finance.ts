import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_URL_FINANCE, API_URL_INVENTORY } from "@/constant/config";
import { apiClient } from "@/lib/api";

export interface SellerPayout {
  id: number;
  shopId: number;
  amount: number;
  status: string;
  createdAt: string;
}

export interface SellerWallet {
  shopId: number;
  grossRevenue: number;
  completedRevenue: number;
  pendingRevenue: number;
  refundedRevenue: number;
  cancelledRevenue: number;
  commission: number;
  availableBalance: number;
  pendingPayout: number;
  paidPayout: number;
  payouts: SellerPayout[];
}

export interface SellerDailyRevenue {
  date: string;
  revenue: number;
  orders: number;
  cancelled: number;
  returned: number;
}

export interface SellerTopProductReport {
  productId: number;
  name: string;
  sold: number;
  revenue: number;
  image?: string | null;
}

export interface SellerReport {
  shopId: number;
  shopName: string;
  days: number;
  dailyRevenue: SellerDailyRevenue[];
  topProducts: SellerTopProductReport[];
  returnRate: number;
  cancelRate: number;
  totalOrders: number;
}

export interface InventoryLedger {
  id: number;
  type: string;
  quantityChange: number;
  stockBefore?: number | null;
  stockAfter?: number | null;
  reason?: string | null;
  createdAt: string;
  product?: { id: number; name: string };
  variant?: { id: number; name: string; sku?: string | null };
}

export const useSellerWallet = () =>
  useQuery({
    queryKey: ["seller", "wallet"],
    queryFn: async (): Promise<SellerWallet> => {
      const response = await apiClient.get(`${API_URL_FINANCE}/seller/wallet`);
      return response.data;
    },
  });

export const useSellerReport = (days = 30) =>
  useQuery({
    queryKey: ["seller", "report", days],
    queryFn: async (): Promise<SellerReport> => {
      const response = await apiClient.get(`${API_URL_FINANCE}/seller/report`, { params: { days } });
      return response.data;
    },
  });

export const useSellerInventoryLedger = () =>
  useQuery({
    queryKey: ["inventory", "seller"],
    queryFn: async (): Promise<InventoryLedger[]> => {
      const response = await apiClient.get(`${API_URL_INVENTORY}/seller/ledger`);
      return response.data;
    },
  });

export const useCreateSellerPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ shopId, amount }: { shopId: number; amount: number }) => {
      const response = await apiClient.post(`${API_URL_FINANCE}/payout`, { shopId, amount });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seller", "wallet"] });
    },
  });
};
