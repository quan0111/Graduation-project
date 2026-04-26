import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { IOrder } from "../types";

export const createOrder = async (data: IOrder): Promise<IOrder> => {
  const res = await apiClient.post(`${API_URL_ORDER}`, data);
  return res.data;
};

type UseCreateOrderOptions = {
  config?: MutationConfig<typeof createOrder>;
};

export const useCreateOrder = ({
  config,
}: UseCreateOrderOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },
    ...config,
  });
};