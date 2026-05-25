import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_URL_MARKETING } from "@/constant/config";
import { apiClient } from "@/lib/api";

export interface MarketingBanner {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  redirectUrl?: string | null;
  linkUrl?: string | null;
  buttonText?: string | null;
  position?: string | null;
  layout?: string | null;
  status?: string;
  priority?: number;
}

type BannerAction = "CLICK" | "VIEW";

type TrackBannerActionPayload = {
  bannerId: number;
  action: BannerAction;
};

const normalizeBanner = (banner: MarketingBanner): MarketingBanner => ({
  ...banner,
  linkUrl: banner.linkUrl ?? banner.redirectUrl ?? null,
  layout: banner.layout ?? "ONE_THIRD",
});

const getActiveBanners = async (position?: string): Promise<MarketingBanner[]> => {
  const response = await apiClient.get<MarketingBanner[]>(`${API_URL_MARKETING}/banners`, {
    params: position ? { position } : undefined,
  });
  return response.data.map(normalizeBanner);
};

const trackBannerAction = async ({ bannerId, action }: TrackBannerActionPayload) => {
  const response = await apiClient.post(`${API_URL_MARKETING}/banners/click`, {
    bannerId,
    action,
  });
  return response.data;
};

const trackBannerClick = async (bannerId: number) => {
  return trackBannerAction({ bannerId, action: "CLICK" });
};

export const useActiveBanners = (position?: string) => {
  return useQuery({
    queryKey: ["marketing", "banners", position ?? "all"],
    queryFn: () => getActiveBanners(position),
    staleTime: 60_000,
  });
};

export const useTrackBannerClick = () => {
  return useMutation({
    mutationFn: trackBannerClick,
  });
};

export const useTrackBannerAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trackBannerAction,
    onSuccess: async (_data, variables) => {
      if (variables.action === "CLICK") {
        await queryClient.invalidateQueries({ queryKey: ["marketing", "banners"] });
      }
    },
  });
};
