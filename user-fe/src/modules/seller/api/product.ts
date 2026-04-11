import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL_PRODUCT } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { IProductCreate } from "../types";

export interface SellerProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  shop_id: number;
  category_id: number;
  created_at: string;
  updated_at: string;
  images?: Array<{
    id: number;
    url: string;
    is_primary: boolean;
  }>;
  variants?: Array<{
    id: number;
    name: string;
    price: number;
    stock: number;
  }>;
}

export interface CreateProductResponse {
  data: SellerProduct;
  message: string;
}

// Get shop products (seller's own products)
export const getSellerProducts = async (shopId: number): Promise<SellerProduct[]> => {
  const response = await apiClient.get(`${API_URL_PRODUCT}/shop/${shopId}`);
  return response.data;
};

export const useGetSellerProducts = (
  shopId: number,
  config?: Omit<UseQueryOptions<SellerProduct[], Error>, "queryKey" | "queryFn">
) => {
  return useQuery<SellerProduct[], Error>({
    queryKey: ["seller", "products", shopId],
    queryFn: () => getSellerProducts(shopId),
    ...config,
  });
};

// Create new product
export const createProduct = async (data: IProductCreate): Promise<CreateProductResponse> => {
  const response = await apiClient.post(API_URL_PRODUCT, data);
  return response.data;
};

export const useCreateProduct = ({
  config,
}: {
  config?: MutationConfig<typeof createProduct>;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["seller", "products", data.data.shop_id],
      });
    },
    ...config,
  });
};

// Update product
export interface UpdateProductDto {
  id: number;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  status?: "ACTIVE" | "INACTIVE" | "BANNED";
}

export const updateProduct = async (data: UpdateProductDto): Promise<SellerProduct> => {
  const { id, ...updateData } = data;
  const response = await apiClient.patch(`${API_URL_PRODUCT}/${id}`, updateData);
  return response.data;
};

export const useUpdateProduct = ({
  config,
}: {
  config?: MutationConfig<typeof updateProduct>;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["seller", "products", data.shop_id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    ...config,
  });
};

// Delete product
export const deleteProduct = async (productId: number): Promise<void> => {
  await apiClient.delete(`${API_URL_PRODUCT}/${productId}`);
};

export const useDeleteProduct = ({
  config,
}: {
  config?: MutationConfig<typeof deleteProduct>;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["seller", "products"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    ...config,
  });
};

// Get product by ID (for editing)
export const getSellerProductById = async (id: number): Promise<SellerProduct> => {
  const response = await apiClient.get(`${API_URL_PRODUCT}/${id}`);
  return response.data;
};

export const useGetSellerProductById = (
  id: number,
  config?: Omit<UseQueryOptions<SellerProduct, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<SellerProduct, Error>({
    queryKey: ["seller", "product", id],
    queryFn: () => getSellerProductById(id),
    ...config,
  });
};