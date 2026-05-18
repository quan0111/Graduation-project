import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_URL_CATEGORY } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";

export const deleteCategory = async (id: number): Promise<void> => {
  await apiClient.patch(`${API_URL_CATEGORY}/${id}/delete`);
};

type UseDeleteCategoryOptions = {
  config?: MutationConfig<typeof deleteCategory>;
};

export const useDeleteCategory = ({ config }: UseDeleteCategoryOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    ...config,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await config?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};
