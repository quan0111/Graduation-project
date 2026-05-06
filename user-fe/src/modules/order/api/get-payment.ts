import { API_URL_ORDER } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

interface PaymentResponse {
  data: any;
  error: boolean;
  message: string;
  timestamp: string;
}

const getPayment = async (id: number): Promise<PaymentResponse> => {
  const res = await apiClient.get(`${API_URL_ORDER}/payment/${id}`);
  return res.data;
};

export const useGetPayment = (
  id: number,
  config?: Omit<
    UseQueryOptions<PaymentResponse, Error, PaymentResponse, ["payment", number]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: () => getPayment(id),
    enabled: !!id,
    ...config,
  });
};