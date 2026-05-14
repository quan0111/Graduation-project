import { useQuery } from "@tanstack/react-query";
import { API_URL_PRODUCT } from "@/constant/config";
import { apiClient } from "@/lib/api";

export interface SellerProduct {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  price: number;
  status: string;
  categoryId?: number;
  shopId?: number;
  totalStock?: number;
  createdAt: string;
  updatedAt?: string;
  category?: {
    id: number;
    name: string;
  };
  shop?: {
    id: number;
    name: string;
  };
  variants?: Array<{
    id: number;
    sku?: string | null;
    name: string;
    price: number;
    stock: number;
    weight?: number | null;
    images?: Array<{ id: number; url: string; position: number }>;
  }>;
  images?: Array<{ id?: number; url: string; position?: number; isPrimary?: boolean }>;
  attributes?: Array<{ id: number; key: string; value: string }>;
  tags?: Array<{ id: number; name: string }>;
}

const getSellerProducts = async (): Promise<SellerProduct[]> => {
  const response = await apiClient.get(`${API_URL_PRODUCT}/me`);
  return response.data;
};

export const useSellerProducts = () => {
  return useQuery({
    queryKey: ["seller-products"],
    queryFn: getSellerProducts,
  });
};
