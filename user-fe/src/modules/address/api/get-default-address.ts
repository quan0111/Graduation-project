import { API_URL_ADDRESS } from "@/constant/config";
import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { IAddress } from "../types";

const map = (d: any): IAddress => ({
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

const getDefaultAddress = async (): Promise<IAddress | null> => {
  const res = await apiClient.get(`${API_URL_ADDRESS}/default`);
  if (!res.data) return null;
  return map(res.data);
};

export const useGetDefaultAddress = () => {
  return useQuery({
    queryKey: ["address-default"],
    queryFn: getDefaultAddress,
  });
};