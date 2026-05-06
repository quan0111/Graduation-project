import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { IOrder } from "../types";

export const updateOrder = async (params: {
  id: number;
  data: Partial<IOrder>;
}): Promise<IOrder> => {
  const res = await apiClient.patch(
    `${API_URL_ORDER}/${params.id}`,
    params.data
  );
  return res.data;
};

type UseUpdateOrderOptions = {
  config?: MutationConfig<typeof updateOrder>;
};

export const useUpdateOrder = ({
  config,
}: UseUpdateOrderOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },
    ...config,
  });
};