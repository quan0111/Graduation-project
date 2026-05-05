import { API_URL_ORDER } from "@/constant/config";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

interface PaymentResponse {
  data: any;
  error: boolean;
  message: string;
  timestamp: string;
}

const createPayment = async (payload: any): Promise<PaymentResponse> => {
  const res = await apiClient.post(`${API_URL_ORDER}/payment`, payload);
  return res.data;
};

export const useCreatePayment = (
  config?: UseMutationOptions<PaymentResponse, Error, any>
) => {
  return useMutation({
    mutationFn: createPayment,
    ...config,
  });
};