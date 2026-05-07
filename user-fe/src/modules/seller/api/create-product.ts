import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_PRODUCT } from "@/constant/config";
import { apiClient } from "@/lib/api";

const createProduct = async (formData: FormData): Promise<any> => {
  const response = await apiClient.post(`${API_URL_PRODUCT}/seller/products`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
  });
};
