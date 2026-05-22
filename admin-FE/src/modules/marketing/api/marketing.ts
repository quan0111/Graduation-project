import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_URL_FLASH_SALE, API_URL_MARKETING } from "@/constant/config";
import { apiClient } from "@/lib/api";

import type {
  Banner,
  BannerCreatePayload,
  BannerStats,
  FlashSale,
  FlashSaleBulkItemCreatePayload,
  FlashSaleBulkItemCreateResponse,
  FlashSaleCreatePayload,
  FlashSaleItemCreatePayload,
  FlashSaleUpdatePayload,
} from "../types";

export const marketingQueryKeys = {
  banners: ["admin", "banners"] as const,
  bannerStats: (id: number) => ["admin", "banners", id, "stats"] as const,
  flashSales: ["admin", "flash-sales"] as const,
};

export const getAdminBanners = async (): Promise<Banner[]> => {
  const response = await apiClient.get<Banner[]>(`${API_URL_MARKETING}/admin/banners`);
  return response.data;
};

export const createBanner = async (payload: BannerCreatePayload): Promise<Banner> => {
  const response = await apiClient.post<Banner>(`${API_URL_MARKETING}/banners`, payload);
  return response.data;
};

export const getBannerStats = async (bannerId: number): Promise<BannerStats> => {
  const response = await apiClient.get<BannerStats>(`${API_URL_MARKETING}/banners/${bannerId}/stats`);
  return response.data;
};

export const getFlashSales = async (): Promise<FlashSale[]> => {
  const response = await apiClient.get<FlashSale[]>(API_URL_FLASH_SALE);
  return response.data;
};

export const createFlashSale = async (payload: FlashSaleCreatePayload): Promise<FlashSale> => {
  const response = await apiClient.post<FlashSale>(API_URL_FLASH_SALE, payload);
  return response.data;
};

export const updateFlashSale = async ({
  id,
  payload,
}: {
  id: number;
  payload: FlashSaleUpdatePayload;
}): Promise<FlashSale> => {
  const response = await apiClient.patch<FlashSale>(`${API_URL_FLASH_SALE}/${id}`, payload);
  return response.data;
};

export const addFlashSaleItem = async ({
  saleId,
  payload,
}: {
  saleId: number;
  payload: FlashSaleItemCreatePayload;
}) => {
  const response = await apiClient.post(`${API_URL_FLASH_SALE}/${saleId}/items`, payload);
  return response.data;
};

export const addFlashSaleItemsBulk = async ({
  saleId,
  payload,
}: {
  saleId: number;
  payload: FlashSaleBulkItemCreatePayload;
}): Promise<FlashSaleBulkItemCreateResponse> => {
  const response = await apiClient.post<FlashSaleBulkItemCreateResponse>(
    `${API_URL_FLASH_SALE}/${saleId}/items/bulk`,
    payload,
  );
  return response.data;
};

export const useAdminBanners = () => {
  return useQuery({
    queryKey: marketingQueryKeys.banners,
    queryFn: getAdminBanners,
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingQueryKeys.banners });
    },
  });
};

export const useBannerStats = (bannerId: number) => {
  return useQuery({
    queryKey: marketingQueryKeys.bannerStats(bannerId),
    queryFn: () => getBannerStats(bannerId),
    enabled: Boolean(bannerId),
  });
};

export const useFlashSales = () => {
  return useQuery({
    queryKey: marketingQueryKeys.flashSales,
    queryFn: getFlashSales,
  });
};

export const useCreateFlashSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFlashSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingQueryKeys.flashSales });
    },
  });
};

export const useUpdateFlashSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFlashSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingQueryKeys.flashSales });
    },
  });
};

export const useAddFlashSaleItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addFlashSaleItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingQueryKeys.flashSales });
    },
  });
};

export const useAddFlashSaleItemsBulk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addFlashSaleItemsBulk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingQueryKeys.flashSales });
    },
  });
};
