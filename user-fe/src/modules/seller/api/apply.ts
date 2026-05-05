import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { ISellerCreate, ISellerApplication } from "../types/seller";

export const applySeller = async (
  data: ISellerCreate,
  userId: number
): Promise<ISellerApplication> => {
  const res = await apiClient.post(`/seller?user_id=${userId}`, data);
  return res.data;
};

type UseApplySellerOptions = {
  config?: any;
};

export const useApplySeller = ({ config }: UseApplySellerOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, userId }: { data: ISellerCreate; userId: number }) =>
      applySeller(data, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller"] });
    },
    ...config,
  });
};