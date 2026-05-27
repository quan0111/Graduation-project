import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";

import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";

import { mapOrder } from "./mapper";
import type { ICreateOrderFormInputs, IOrder, IPayment } from "../types";

export interface CheckoutPayload extends ICreateOrderFormInputs {
  cartItemIds?: number[];
}

export interface CheckoutResponse {
  order: IOrder;
  orders: IOrder[];
  payment?: IPayment | null;
  paymentUrl?: string | null;
  qrCodeUrl?: string | null;
  deeplink?: string | null;
  providerOrderId?: string | null;
  requestId?: string | null;
}

const mapPayment = (payment: any): IPayment | null =>
  payment
    ? {
        id: payment.id,
        order_id: payment.orderId,
        method: payment.method,
        status: payment.status?.toLowerCase(),
        amount: payment.amount ?? null,
        provider_order_id: payment.providerOrderId ?? null,
        request_id: payment.requestId ?? null,
        transaction_id: payment.transactionId ?? null,
        payment_url: payment.paymentUrl ?? null,
        qr_code_url: payment.qrCodeUrl ?? null,
        deeplink: payment.deeplink ?? null,
        provider_message: payment.providerMessage ?? null,
        paid_at: payment.paidAt ?? null,
        created_at: payment.createdAt,
        updated_at: payment.updatedAt ?? null,
      }
    : null;

export const checkout = async (payload: CheckoutPayload): Promise<CheckoutResponse> => {
  const response = await apiClient.post(`${API_URL_ORDER}/checkout`, payload);
  const orders = Array.isArray(response.data.orders)
    ? response.data.orders.map(mapOrder)
    : [mapOrder(response.data.order)];
  return {
    order: mapOrder(response.data.order),
    orders,
    payment: mapPayment(response.data.payment),
    paymentUrl: response.data.paymentUrl ?? null,
    qrCodeUrl: response.data.qrCodeUrl ?? null,
    deeplink: response.data.deeplink ?? null,
    providerOrderId: response.data.providerOrderId ?? null,
    requestId: response.data.requestId ?? null,
  };
};

export const useCheckoutOrder = (
  config?: UseMutationOptions<CheckoutResponse, Error, CheckoutPayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkout,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders", "me"] }),
        queryClient.invalidateQueries({ queryKey: ["cart"] }),
      ]);
    },
    ...config,
  });
};
