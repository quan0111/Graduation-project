import { useQuery } from "@tanstack/react-query";

import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";

export interface SellerCustomer {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  order_count: number;
  total_spent: number;
  last_order_date?: string | null;
}

interface SellerOrderResponse {
  id: number;
  createdAt?: string;
  created_at?: string;
  userId?: number;
  user_id?: number;
  user?: {
    id: number;
    email?: string | null;
    fullName?: string | null;
    phone?: string | null;
  } | null;
  items?: Array<{
    price?: number;
    quantity?: number;
  }>;
}

const getSellerCustomers = async (): Promise<SellerCustomer[]> => {
  const response = await apiClient.get<SellerOrderResponse[]>(`${API_URL_ORDER}/seller`);
  const customers = new Map<number, SellerCustomer>();

  response.data.forEach((order) => {
    const userId = order.user?.id ?? order.userId ?? order.user_id;
    if (!userId) return;

    const orderDate = order.createdAt ?? order.created_at ?? null;
    const orderTotal = (order.items ?? []).reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );
    const current = customers.get(userId) ?? {
      id: userId,
      name: order.user?.fullName || order.user?.email || `Khách #${userId}`,
      email: order.user?.email ?? null,
      phone: order.user?.phone ?? null,
      order_count: 0,
      total_spent: 0,
      last_order_date: null,
    };

    current.order_count += 1;
    current.total_spent += orderTotal;
    if (
      orderDate &&
      (!current.last_order_date || new Date(orderDate).getTime() > new Date(current.last_order_date).getTime())
    ) {
      current.last_order_date = orderDate;
    }

    customers.set(userId, current);
  });

  return Array.from(customers.values()).sort((left, right) => right.total_spent - left.total_spent);
};

export const useSellerCustomers = () =>
  useQuery({
    queryKey: ["seller", "customers"],
    queryFn: getSellerCustomers,
  });
