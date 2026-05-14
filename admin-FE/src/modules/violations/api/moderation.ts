import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_URL_MODERATION, API_URL_SECURITY } from "@/constant/config";
import { apiClient } from "@/lib/api";

export interface ModerationCase {
  id: number;
  productId: number;
  sellerId?: number | null;
  status: string;
  violationType?: string | null;
  reason: string;
  adminNote?: string | null;
  sellerNote?: string | null;
  evidence?: Array<Record<string, unknown>> | null;
  product?: any;
  seller?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityIncident {
  id: number;
  userId: number;
  severity: string;
  reason: string;
  status: string;
  actionTaken?: string | null;
  metadata?: Record<string, unknown> | null;
  detectedAt: string;
  user?: any;
}

export const useModerationCases = () =>
  useQuery({
    queryKey: ["moderation-cases"],
    queryFn: async (): Promise<ModerationCase[]> => {
      const res = await apiClient.get(`${API_URL_MODERATION}/cases`);
      return res.data;
    },
  });

export const useResolveModerationCase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, decision, adminNote }: { id: number; decision: "RESTORE" | "UPHOLD" | "CLOSE"; adminNote?: string }) => {
      const res = await apiClient.patch(`${API_URL_MODERATION}/cases/${id}/resolve`, { decision, adminNote });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation-cases"] });
    },
  });
};

export const useSecurityIncidents = () =>
  useQuery({
    queryKey: ["security-incidents"],
    queryFn: async (): Promise<SecurityIncident[]> => {
      const res = await apiClient.get(`${API_URL_SECURITY}/incidents`);
      return res.data;
    },
  });

export const useResolveSecurityIncident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, unlockUser }: { id: number; unlockUser?: boolean }) => {
      const res = await apiClient.patch(`${API_URL_SECURITY}/incidents/${id}/resolve`, {
        status: "RESOLVED",
        unlockUser: Boolean(unlockUser),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-incidents"] });
    },
  });
};
