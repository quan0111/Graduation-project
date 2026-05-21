import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { IPayment } from "@/modules/order/types";

export interface RetryPaymentResponse {
  payment?: IPayment;
  paymentUrl?: string | null;
  qrCodeUrl?: string | null;
  deeplink?: string | null;
  providerOrderId?: string | null;
  requestId?: string | null;
}

const retryPayment = async (paymentId: number): Promise<RetryPaymentResponse> => {
  const response = await apiClient.post<RetryPaymentResponse>(`${API_URL_ORDER}/payment/${paymentId}/retry`);
  return response.data;
};

export const useRetryPayment = (
  config?: UseMutationOptions<RetryPaymentResponse, Error, number>,
) => {
  return useMutation({
    mutationFn: retryPayment,
    ...config,
  });
};
