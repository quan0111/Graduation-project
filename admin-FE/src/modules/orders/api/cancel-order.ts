import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";

export const cancelOrder = async (id: number): Promise<any> => {
  const res = await apiClient.patch(`${API_URL_ORDER}/${id}/cancel`);
  return res.data;
};

type UseCancelOrderOptions = {
  config?: MutationConfig<typeof cancelOrder>;
};

export const useCancelOrder = ({
  config,
}: UseCancelOrderOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },
    ...config,
  });
};