import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { ICreateOrderFormInputs } from "../types";

export const createOrder = async (
  data: ICreateOrderFormInputs
): Promise<any> => {
  const response = await apiClient.post(API_URL_ORDER, data);
  return response.data;
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
        queryKey: ["Orders"],
      });
    },
    ...config,
  });
};