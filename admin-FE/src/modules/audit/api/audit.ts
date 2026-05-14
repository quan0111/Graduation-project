import { useQuery } from "@tanstack/react-query";

import { API_URL_AUDIT } from "@/constant/config";
import { apiClient } from "@/lib/api";

export interface AuditLog {
  id: number;
  actorId?: number | null;
  targetUserId?: number | null;
  action: string;
  entityType: string;
  entityId?: number | null;
  severity: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  actor?: any;
  targetUser?: any;
}

export const useAuditLogs = () =>
  useQuery({
    queryKey: ["audit-logs"],
    queryFn: async (): Promise<AuditLog[]> => {
      const res = await apiClient.get(`${API_URL_AUDIT}/logs`, { params: { limit: 150 } });
      return res.data;
    },
  });
