import { apiClient } from "../../../lib/api";
import { useQuery } from "@tanstack/react-query";
import { useMe } from "@/modules/auth/api/get-auth-me";
import { API_URL_CART } from "@/constant/config";
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
  const res = await apiClient.get(`${API_URL_CART}/user/${userId}`);
  return res.data;
};

export const useCart = () => {
  const { data: user } = useMe();

  return useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => getCart(user!.id),
    enabled: !!user?.id, 
    staleTime: 1000 * 60 * 2,
  });
};
