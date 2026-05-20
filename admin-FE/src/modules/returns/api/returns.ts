import { useMutation, useQuery } from "@tanstack/react-query";

import { API_URL_RETURN } from "@/constant/config";
import { apiClient } from "@/lib/api";

export interface ReturnRequest {
  id: number;
  orderId: number;
  userId: number;
  reason: string;
  description?: string | null;
  rejectReason?: string | null;
  refundAmount?: number | null;
  status: string;
  gatewayRefundStatus?: string | null;
  gatewayRefundTransactionId?: string | null;
  gatewayRefundedAt?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  user?: {
    id: number;
    email: string;
    fullName?: string | null;
  } | null;
  order?: {
    id: number;
    totalAmount: number;
    status?: string | null;
  } | null;
  items: any[];
  evidences: any[];
}

export interface ReturnReviewPayload {
  status: "APPROVED" | "REJECTED";
  rejectReason?: string;
}

const getAdminReturnRequests = async (): Promise<ReturnRequest[]> => {
  const response = await apiClient.get(`${API_URL_RETURN}/admin`);
  return response.data;
};

const reviewReturnRequest = async ({
  returnId,
  payload,
}: {
  returnId: number;
  payload: ReturnReviewPayload;
}) => {
  const response = await apiClient.patch(`${API_URL_RETURN}/${returnId}/review`, payload);
  return response.data;
};

const confirmGatewayRefund = async ({
  returnId,
  transactionId,
}: {
  returnId: number;
  transactionId: string;
}) => {
  const response = await apiClient.patch(`${API_URL_RETURN}/${returnId}/gateway-refund`, {
    transactionId,
  });
  return response.data;
};

export const useAdminReturnRequests = () =>
  useQuery({
    queryKey: ["returns", "admin"],
    queryFn: getAdminReturnRequests,
  });

export const useReviewReturnRequest = () =>
  useMutation({
    mutationFn: reviewReturnRequest,
  });

export const useConfirmGatewayRefund = () =>
  useMutation({
    mutationFn: confirmGatewayRefund,
  });
