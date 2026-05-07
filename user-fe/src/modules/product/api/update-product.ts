import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";

import { API_URL_PRODUCT } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { IProduct } from "../types";

export type UpdateProductDto = Partial<IProduct> & {
  status?: "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "BANNED";
};

const updateProduct = async (id: number, data: UpdateProductDto): Promise<IProduct> => {
  const response = await apiClient.patch(`${API_URL_PRODUCT}/${id}`, data);
  return response.data;
};

export const useUpdateProduct = (
  config?: UseMutationOptions<IProduct, Error, { id: number; data: UpdateProductDto }>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["seller", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", variables.id] });
    },
    ...config,
  });
};
