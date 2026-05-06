import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export const createVariant = async (data: any) => {
  const res = await apiClient.post(`/products/variants`, data);
  return res.data;
};

export const useCreateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVariant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants"] });
    },
  });
};