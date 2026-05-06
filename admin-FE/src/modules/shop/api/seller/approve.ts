import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";

export const approveSeller = async (params: {
  id: number;
  admin_id: number;
}) => {
  const res = await apiClient.patch(
    `/seller/${params.id}/approve?admin_id=${params.admin_id}`
  );
  return res.data;
};

type UseApproveSellerOptions = {
  config?: MutationConfig<typeof approveSeller>;
};

export const useApproveSeller = ({ config }: UseApproveSellerOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveSeller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller"] });
    },
    ...config,
  });
};