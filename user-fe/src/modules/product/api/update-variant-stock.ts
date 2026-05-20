import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_URL_INVENTORY } from "@/constant/config";
import { apiClient } from "@/lib/api";

type UpdateVariantStockPayload = {
  variantId: number;
  quantity: number;
  reason?: string;
};

const updateVariantStock = async ({ variantId, quantity, reason }: UpdateVariantStockPayload) => {
  const response = await apiClient.patch(`${API_URL_INVENTORY}/variants/${variantId}/adjust`, {
    quantityChange: quantity,
    reason: reason || "Seller manual stock adjustment",
  });
  return response.data;
};

export const useUpdateVariantStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVariantStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
