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

export const getMyCart = async (): Promise<ICart> => {
  const res = await apiClient.get(`${API_URL_CART}/me`);
  return res.data;
};

export const useMyCart = () => {
  const { data: user } = useMe();

  return useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => getMyCart(),
    enabled: !!user?.id, 
    staleTime: 1000 * 60 * 2,
  });
};
