import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { API_URL_RETURN } from "@/constant/config";
import { apiClient } from "@/lib/api";

export interface ReturnRequest {
  id: number;
  orderId: number;
  userId: number;
  reason: string;
  status: string;
  createdAt: string;
  user?: {
    id: number;
    email: string;
  };
  order?: {
    id: number;
    totalAmount: number;
  };
  items: any[];
  evidences: any[];
}

const getReturnRequest = async (returnId: number): Promise<ReturnRequest> => {
  const response = await apiClient.get(`${API_URL_RETURN}/${returnId}`);
  return response.data;
};

const getUserReturnRequests = async (userId: number): Promise<ReturnRequest[]> => {
  const response = await apiClient.get(`${API_URL_RETURN}/user/${userId}`);
  return response.data;
};

export const useReturnRequest = (
  returnId: number,
  config?: UseQueryOptions<ReturnRequest, Error>,
) => {
  return useQuery({
    queryKey: ["return", returnId],
    queryFn: () => getReturnRequest(returnId),
    ...config,
  });
};

export const useUserReturnRequests = (
  userId: number,
  config?: UseQueryOptions<ReturnRequest[], Error>,
) => {
  return useQuery({
    queryKey: ["returns", "user", userId],
    queryFn: () => getUserReturnRequests(userId),
    ...config,
  });
};
