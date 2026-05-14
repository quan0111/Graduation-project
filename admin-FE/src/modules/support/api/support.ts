import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_URL } from "@/constant/config";
import { apiClient } from "@/lib/api";

export interface SupportMessage {
  id: number;
  ticketId: number;
  senderRole: string;
  message: string;
  createdAt: string;
  sender?: { id: number; email: string; fullName?: string | null };
}

export interface SupportTicket {
  id: number;
  subject: string;
  status: string;
  priority: string;
  category?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: number; email: string; fullName?: string | null };
  shop?: { id: number; name: string } | null;
  messages: SupportMessage[];
}

const SUPPORT_URL = `${API_URL}support`;

export const useAdminSupportTickets = () =>
  useQuery({
    queryKey: ["support", "admin"],
    queryFn: async (): Promise<SupportTicket[]> => {
      const response = await apiClient.get(`${SUPPORT_URL}/tickets/admin`);
      return response.data;
    },
  });

export const useAddSupportMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: number; message: string }) => {
      const response = await apiClient.post(`${SUPPORT_URL}/tickets/${ticketId}/messages`, { message });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["support", "admin"] });
    },
  });
};

export const useUpdateSupportTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: number; status: string }) => {
      const response = await apiClient.patch(`${SUPPORT_URL}/tickets/${ticketId}`, { status });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["support", "admin"] });
    },
  });
};
