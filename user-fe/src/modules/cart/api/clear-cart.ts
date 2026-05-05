import { apiClient } from "../../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const clearCart = async (cartId: number) => {
  const res = await apiClient.delete(`/cart/${cartId}/clear`);
  return res.data;
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};