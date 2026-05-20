import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_URL_MARKETING } from "@/constant/config";
import { apiClient } from "@/lib/api";

export interface MarketingBanner {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  position?: string | null;
  status?: string;
}

const getActiveBanners = async (): Promise<MarketingBanner[]> => {
  const response = await apiClient.get(`${API_URL_MARKETING}/banners`);
  return response.data;
};

const trackBannerClick = async (bannerId: number) => {
  const response = await apiClient.post(`${API_URL_MARKETING}/banners/click`, {
    bannerId,
    action: "CLICK",
  });
  return response.data;
};

export const useActiveBanners = () => {
  return useQuery({
    queryKey: ["marketing", "banners"],
    queryFn: getActiveBanners,
    staleTime: 60_000,
  });
};

export const useTrackBannerClick = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trackBannerClick,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["marketing", "banners"] });
    },
  });
};
