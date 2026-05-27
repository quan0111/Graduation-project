import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_URL_MODERATION } from "@/constant/config";
import { apiClient } from "@/lib/api";

export interface SellerModerationCase {
  id: number;
  productId: number;
  status: string;
  violationType?: string | null;
  reason: string;
  adminNote?: string | null;
  sellerNote?: string | null;
  evidence?: Array<Record<string, unknown>> | null;
  product?: any;
  createdAt: string;
  updatedAt: string;
}

export type ModerationEvidence = {
  type: "url" | "file";
  url: string;
  name?: string;
  contentType?: string;
  resourceType?: string;
  publicId?: string;
};

export const useSellerModerationCases = () =>
  useQuery({
    queryKey: ["seller-moderation-cases"],
    queryFn: async (): Promise<SellerModerationCase[]> => {
      const res = await apiClient.get(`${API_URL_MODERATION}/cases/me`);
      return res.data;
    },
  });

export const useSubmitProductAppeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      sellerNote,
      evidenceUrl,
      evidence: uploadedEvidence,
    }: {
      productId: number;
      sellerNote: string;
      evidenceUrl?: string;
      evidence?: ModerationEvidence[];
    }) => {
      const manualEvidence = evidenceUrl?.trim() ? [{ type: "url" as const, url: evidenceUrl.trim() }] : [];
      const evidence = [...(uploadedEvidence ?? []), ...manualEvidence];
      const res = await apiClient.post(`${API_URL_MODERATION}/products/${productId}/appeal`, {
        sellerNote,
        evidence,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-moderation-cases"] });
    },
  });
};
