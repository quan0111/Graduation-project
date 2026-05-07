import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_URL_PRODUCT } from "@/constant/config";
import { apiClient } from "@/lib/api";

type UpdateVariantStockPayload = {
  variantId: number;
  quantity: number;
};

const updateVariantStock = async ({ variantId, quantity }: UpdateVariantStockPayload) => {
  const response = await apiClient.patch(`${API_URL_PRODUCT}/variants/${variantId}/stock`, null, {
    params: { quantity },
  });
  return response.data;
};

export const useUpdateVariantStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVariantStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
