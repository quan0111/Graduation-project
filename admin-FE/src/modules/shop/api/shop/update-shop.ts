import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_SHOP } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";

export const updateShop = async (params: {
  id: number;
  data: any;
}) => {
  const res = await apiClient.patch(
    `${API_URL_SHOP}/${params.id}`,
    params.data
  );
  return res.data;
};

type UseUpdateShopOptions = {
  config?: MutationConfig<typeof updateShop>;
};

export const useUpdateShop = ({ config }: UseUpdateShopOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateShop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
    },
    ...config,
  });
};