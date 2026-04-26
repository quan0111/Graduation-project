import { useMutation } from "@tanstack/react-query";
import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { IPayment } from "../types";

export const updatePayment = async (params: {
  id: number;
  status: string;
}): Promise<IPayment> => {
  const res = await apiClient.patch(
    `${API_URL_ORDER}/payment/${params.id}`,
    { status: params.status }
  );
  return res.data;
};

type UseUpdatePaymentOptions = {
  config?: MutationConfig<typeof updatePayment>;
};

export const useUpdatePayment = ({
  config,
}: UseUpdatePaymentOptions = {}) => {
  return useMutation({
    mutationFn: updatePayment,
    ...config,
  });
};