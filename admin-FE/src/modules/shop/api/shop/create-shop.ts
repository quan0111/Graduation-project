import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_SHOP } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { IShop } from "@/modules/shop/types";

export const createShop = async (data: IShop): Promise<any> => {
  const res = await apiClient.post(`${API_URL_SHOP}`, data);
  return res.data;
};

type UseCreateShopOptions = {
  config?: MutationConfig<typeof createShop>;
};

export const useCreateShop = ({ config }: UseCreateShopOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createShop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
    },
    ...config,
  });
};