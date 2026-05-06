import { API_URL_ADDRESS } from "@/constant/config";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { IAddress } from "../types";


// 🔥 MAP BACKEND → FRONTEND
const mapAddress = (d: any): IAddress => ({
  id: d.id,
  user_id: d.userId,

  full_name: d.fullName,
  phone: d.phone,
  address_line: d.addressLine,
  ward: d.ward,
  district: d.district,
  province: d.province,
  country: d.country,
  postal_code: d.postalCode,

  is_default: d.isDefault,
  type: "HOME",

  created_at: d.createdAt,
  updated_at: d.updatedAt,
  deleted_at: d.deletedAt,
});


// ===== API =====
const getAddresses = async (): Promise<IAddress[]> => {
  const res = await apiClient.get(`${API_URL_ADDRESS}`);
  return res.data.map(mapAddress);
};


// ===== HOOK =====
export const useGetAddresses = (
  config?: Omit<
    UseQueryOptions<IAddress[], Error, IAddress[], ["addresses"]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<IAddress[], Error, IAddress[], ["addresses"]>({
    queryKey: ["addresses"],
    queryFn: getAddresses,
    ...config,
  });
};