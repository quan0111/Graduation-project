import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { API_URL_RETURN } from "@/constant/config";
import { apiClient } from "@/lib/api";

export interface ReturnRequestCreatePayload {
  orderId: number;
  reason: string;
  description?: string;
  items: ReturnItemCreatePayload[];
  evidences?: ReturnEvidenceCreatePayload[];
}

export interface ReturnItemCreatePayload {
  orderItemId: number;
  quantity: number;
}

export interface ReturnEvidenceCreatePayload {
  imageUrl: string;
}

const createReturnRequest = async (payload: ReturnRequestCreatePayload) => {
  const response = await apiClient.post(`${API_URL_RETURN}/`, payload);
  return response.data;
};

const addReturnItem = async (returnId: number, payload: ReturnItemCreatePayload) => {
  const response = await apiClient.post(`${API_URL_RETURN}/${returnId}/items`, payload);
  return response.data;
};

const addReturnEvidence = async (returnId: number, payload: ReturnEvidenceCreatePayload) => {
  const response = await apiClient.post(`${API_URL_RETURN}/${returnId}/evidence`, payload);
  return response.data;
};

const refundReturnRequest = async (returnId: number) => {
  const response = await apiClient.patch(`${API_URL_RETURN}/${returnId}/refund`);
  return response.data;
};

export const useCreateReturnRequest = (
  config?: UseMutationOptions<any, Error, ReturnRequestCreatePayload>,
) => {
  return useMutation({
    mutationFn: createReturnRequest,
    ...config,
  });
};

export const useAddReturnItem = (
  config?: UseMutationOptions<any, Error, { returnId: number; payload: ReturnItemCreatePayload }>,
) => {
  return useMutation({
    mutationFn: ({ returnId, payload }) => addReturnItem(returnId, payload),
    ...config,
  });
};

export const useAddReturnEvidence = (
  config?: UseMutationOptions<any, Error, { returnId: number; payload: ReturnEvidenceCreatePayload }>,
) => {
  return useMutation({
    mutationFn: ({ returnId, payload }) => addReturnEvidence(returnId, payload),
    ...config,
  });
};

export const useRefundReturnRequest = (
  config?: UseMutationOptions<any, Error, number>,
) => {
  return useMutation({
    mutationFn: refundReturnRequest,
    ...config,
  });
};
