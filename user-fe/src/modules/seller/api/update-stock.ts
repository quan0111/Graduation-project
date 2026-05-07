import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_PRODUCT } from "@/constant/config";
import { apiClient } from "@/lib/api";

interface UpdateStockParams {
  productId: number;
  stock: number;
}

const updateStock = async ({ productId, stock }: UpdateStockParams): Promise<void> => {
  await apiClient.patch(`${API_URL_PRODUCT}/${productId}/stock`, { stock });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateStock,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
  });
};
