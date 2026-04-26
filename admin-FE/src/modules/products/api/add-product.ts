import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API_URL_PRODUCT } from "@/constant/config";
import type { MutationConfig } from "@/lib/react-query";
import type { IProduct } from "../types";

export const createProduct = async (data: IProduct) => {
  const res = await apiClient.post(`${API_URL_PRODUCT}`, data);
  return res.data;
};

type UseCreateProductOptions = {
  config?: MutationConfig<typeof createProduct>;
};

export const useCreateProduct = ({ config }: UseCreateProductOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },

    ...config,
  });
};