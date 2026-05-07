import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_PRODUCT } from "@/constant/config";
import { apiClient } from "@/lib/api";

const updateProduct = async ({ id, data }: { id: number; data: FormData }): Promise<any> => {
  const response = await apiClient.patch(`${API_URL_PRODUCT}/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
  });
};
