import { API_URL_ORDER } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

interface PaymentResponse {
  data: any;
  error: boolean;
  message: string;
  timestamp: string;
}

const getPaymentByOrder = async (
  orderId: number
): Promise<PaymentResponse> => {
  const res = await apiClient.get(
    `${API_URL_ORDER}/payment/order/${orderId}`
  );
  return res.data;
};

export const useGetPaymentByOrder = (
  orderId: number,
  config?: Omit<
    UseQueryOptions<
      PaymentResponse,
      Error,
      PaymentResponse,
      ["payment", "order", number]
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["payment", "order", orderId],
    queryFn: () => getPaymentByOrder(orderId),
    enabled: !!orderId,
    ...config,
  });
};