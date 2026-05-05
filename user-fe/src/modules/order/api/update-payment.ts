import { API_URL_ORDER } from "@/constant/config";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

interface PaymentResponse {
  data: any;
  error: boolean;
  message: string;
  timestamp: string;
}

const updatePayment = async (data: {
  id: number;
  status: string;
}): Promise<PaymentResponse> => {
  const res = await apiClient.patch(
    `${API_URL_ORDER}/payment/${data.id}`,
    { status: data.status }
  );
  return res.data;
};

export const useUpdatePayment = (
  config?: UseMutationOptions<
    PaymentResponse,
    Error,
    { id: number; status: string }
  >
) => {
  return useMutation({
    mutationFn: updatePayment,
    ...config,
  });
};