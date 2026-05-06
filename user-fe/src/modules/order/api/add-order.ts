import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";

import { mapOrder } from "./mapper";
import type { ICreateOrderFormInputs, IOrder } from "../types";

export const createOrder = async (
  data: ICreateOrderFormInputs,
): Promise<IOrder> => {
  const response = await apiClient.post(API_URL_ORDER, data);
  return mapOrder(response.data);
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["orders", "me"],
      });
    },
    ...config,
  });
};
