import { useMutation } from "@tanstack/react-query";
import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { IPayment } from "../types";

export const createPayment = async (data: IPayment): Promise<IPayment> => {
  const res = await apiClient.post(`${API_URL_ORDER}/payment`, data);
  return res.data;
};

type UseCreatePaymentOptions = {
  config?: MutationConfig<typeof createPayment>;
};

export const useCreatePayment = ({
  config,
}: UseCreatePaymentOptions = {}) => {
  return useMutation({
    mutationFn: createPayment,
    ...config,
  });
};