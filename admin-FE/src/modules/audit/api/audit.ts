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

export interface AuditLogPage {
  data: AuditLog[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AuditLogQuery {
  page?: number;
  pageSize?: number;
  severity?: string;
  action?: string;
  entityType?: string;
}

export const useAuditLogs = ({ page = 1, pageSize = 25, severity, action, entityType }: AuditLogQuery = {}) =>
  useQuery({
    queryKey: ["audit-logs", page, pageSize, severity, action, entityType],
    queryFn: async (): Promise<AuditLogPage> => {
      const res = await apiClient.get(`${API_URL_AUDIT}/logs`, {
        params: {
          page,
          page_size: pageSize,
          ...(severity ? { severity } : {}),
          ...(action ? { action } : {}),
          ...(entityType ? { entity_type: entityType } : {}),
        },
      });
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });
