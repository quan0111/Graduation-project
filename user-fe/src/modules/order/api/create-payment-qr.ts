import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { PaymentMethodType } from "@/modules/order/types";

export interface PaymentQrPayload {
  orderId: number;
  method: Extract<PaymentMethodType, "MOMO" | "VNPAY">;
}

export interface PaymentQrResponse {
  paymentUrl?: string | null;
  qrCodeUrl?: string | null;
  deeplink?: string | null;
  providerOrderId?: string | null;
  requestId?: string | null;
}

const createPaymentQr = async (payload: PaymentQrPayload): Promise<PaymentQrResponse> => {
  const response = await apiClient.post(`${API_URL_ORDER}/payment/qr`, payload);
  return response.data;
};

export const useCreatePaymentQr = (
  config?: UseMutationOptions<PaymentQrResponse, Error, PaymentQrPayload>,
) => {
  return useMutation({
    mutationFn: createPaymentQr,
    ...config,
  });
};
