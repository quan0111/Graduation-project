import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_SHOP } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";

export const deleteShop = async (id: number) => {
  const res = await apiClient.patch(`${API_URL_SHOP}/${id}/delete`);
  return res.data;
};

type UseDeleteShopOptions = {
  config?: MutationConfig<typeof deleteShop>;
};

export const useDeleteShop = ({ config }: UseDeleteShopOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteShop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
    },
    ...config,
  });
};