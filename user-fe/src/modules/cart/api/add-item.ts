import { apiClient } from "../../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_CART } from "@/constant/config";
export const addItem = async (data: {
  productId: number;
  variantId?: number | null;
  quantity: number;
}) => {
  const res = await apiClient.post(API_URL_CART + "/items", data);
  return res.data;
};

export const useAddItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addItem,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};