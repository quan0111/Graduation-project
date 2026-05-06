import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API_URL_PRODUCT } from "@/constant/config";
import type { MutationConfig } from "@/lib/react-query";

export const updateProduct = async ({
  id,
  data,
}: {
  id: number;
  data: any;
}) => {
  const res = await apiClient.patch(`${API_URL_PRODUCT}/${id}`, data);
  return res.data;
};

type UseUpdateProductOptions = {
  config?: MutationConfig<typeof updateProduct>;
};

export const useUpdateProduct = ({
  config,
}: UseUpdateProductOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: ["product", variables.id],
      });
    },

    ...config,
  });
};