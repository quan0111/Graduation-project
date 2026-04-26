import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";

export const applySeller = async (params: {
  user_id: number;
  data: {
    shopName: string;
    description?: string;
  };
}) => {
  const res = await apiClient.post(
    `/seller?user_id=${params.user_id}`,
    params.data
  );
  return res.data;
};

type UseApplySellerOptions = {
  config?: MutationConfig<typeof applySeller>;
};

export const useApplySeller = ({ config }: UseApplySellerOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applySeller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller"] });
    },
    ...config,
  });
};