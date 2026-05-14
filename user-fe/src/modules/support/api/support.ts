import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_URL_SUPPORT } from "@/constant/config";
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

export const useSellerSupportTickets = () =>
  useQuery({
    queryKey: ["support", "seller"],
    queryFn: async (): Promise<SupportTicket[]> => {
      const response = await apiClient.get(`${API_URL_SUPPORT}/tickets/seller`);
      return response.data;
    },
  });

export const useMySupportTickets = () =>
  useQuery({
    queryKey: ["support", "me"],
    queryFn: async (): Promise<SupportTicket[]> => {
      const response = await apiClient.get(`${API_URL_SUPPORT}/tickets/me`);
      return response.data;
    },
  });

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { subject: string; message: string; shopId?: number; orderId?: number; returnRequestId?: number; category?: string }) => {
      const response = await apiClient.post(`${API_URL_SUPPORT}/tickets`, payload);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["support", "me"] });
    },
  });
};

export const useAddSupportMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: number; message: string }) => {
      const response = await apiClient.post(`${API_URL_SUPPORT}/tickets/${ticketId}/messages`, { message });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["support", "seller"] });
      await queryClient.invalidateQueries({ queryKey: ["support", "me"] });
    },
  });
};
