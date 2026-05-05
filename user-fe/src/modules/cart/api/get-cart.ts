import { apiClient } from "../../../lib/api";
import { useQuery } from "@tanstack/react-query";

export interface ICartItem {
  id: number;
  product_id: number;
  quantity: number;
  price?: number;
}

export interface ICart {
  id: number;
  user_id: number;
  items: ICartItem[];
  total?: number;
  discount?: number;
}

export const getCart = async (userId: number): Promise<ICart> => {
  const res = await apiClient.get(`/cart/user/${userId}`);
  return res.data;
};

export const useCart = (userId?: number) => {
  return useQuery({
    queryKey: ["cart", userId],
    queryFn: () => getCart(userId as number),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
};