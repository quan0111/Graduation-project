import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";

export const rejectSeller = async (params: {
  id: number;
}) => {
  const res = await apiClient.patch(`/seller/${params.id}/reject`);
  return res.data;
};

type UseRejectSellerOptions = {
  config?: MutationConfig<typeof rejectSeller>;
};

export const useRejectSeller = ({ config }: UseRejectSellerOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectSeller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller"] });
    },
    ...config,
  });
};
