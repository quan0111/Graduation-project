import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { QueryConfig } from "@/lib/react-query";

export const getAllSeller = async () => {
  const res = await apiClient.get(`/seller`);
  return res.data;
};

type UseGetAllSellerOptions = {
  config?: QueryConfig<typeof getAllSeller>;
};

export const useGetAllSeller = ({ config }: UseGetAllSellerOptions = {}) => {
  return useQuery({
    queryKey: ["seller"],
    queryFn: getAllSeller,
    ...config,
  });
};