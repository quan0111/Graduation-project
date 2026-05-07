import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_PRODUCT } from "@/constant/config";
import { apiClient } from "@/lib/api";

const deleteProduct = async (productId: number): Promise<void> => {
  await apiClient.delete(`${API_URL_PRODUCT}/${productId}`);
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
  });
};
