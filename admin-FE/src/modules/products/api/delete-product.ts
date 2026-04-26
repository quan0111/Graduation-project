import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API_URL_PRODUCT } from "@/constant/config";
import type { MutationConfig } from "@/lib/react-query";

export const deleteProduct = async (id: number) => {
  const res = await apiClient.patch(`${API_URL_PRODUCT}/${id}/delete`);
  return res.data;
};

type UseDeleteProductOptions = {
  config?: MutationConfig<typeof deleteProduct>;
};

export const useDeleteProduct = ({
  config,
}: UseDeleteProductOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },

    ...config,
  });
};