import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_URL_PRODUCT } from "@/constant/config";
import { apiClient } from "@/lib/api";

type UpdateVariantPayload = {
  variantId: number;
  data: {
    price?: number;
    stock?: number;
    sku?: string | null;
    name?: string;
    weight?: number | null;
  };
};

const updateVariant = async ({ variantId, data }: UpdateVariantPayload) => {
  const response = await apiClient.patch(`${API_URL_PRODUCT}/variants/${variantId}`, data);
  return response.data;
};

export const useUpdateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVariant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
