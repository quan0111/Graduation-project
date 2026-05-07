import { useQuery } from "@tanstack/react-query";
import { API_URL_PRODUCT } from "@/constant/config";
import { apiClient } from "@/lib/api";

export interface SellerProduct {
  id: number;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  sold_count?: number;
  is_active: boolean;
  images?: Array<{ url: string }>;
  shop_id: number;
  created_at: string;
  updated_at: string;
}

const getSellerProducts = async (): Promise<SellerProduct[]> => {
  const response = await apiClient.get(`${API_URL_PRODUCT}/seller/products`);
  return response.data;
};

export const useSellerProducts = () => {
  return useQuery({
    queryKey: ["seller-products"],
    queryFn: getSellerProducts,
  });
};
