import { apiClient } from "../../../lib/api";
import { useQuery } from "@tanstack/react-query";
import { useMe } from "@/modules/auth/api/get-auth-me";

export interface ICartItem {
  id: number;
  quantity: number;
  product?: any;
  variant?: any;
}

export interface ICart {
  id: number;
  userId: number;
  items: ICartItem[];
}

export const getCart = async (userId: number): Promise<ICart> => {
  const res = await apiClient.get(`/cart/user/${userId}`);
  return res.data;
};

export const useCart = () => {
  const { data: user, isLoading: userLoading } = useMe();

  return useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => getCart(user!.id),
    enabled: !!user?.id, 
    staleTime: 1000 * 60 * 2,
  });
};