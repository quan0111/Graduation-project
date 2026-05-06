import { API_URL_ADDRESS } from "@/constant/config";
import { apiClient } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IAddress } from "../types";


const createAddress = async (data: Partial<IAddress>) => {
  const res = await apiClient.post(`${API_URL_ADDRESS}`, {
    fullName: data.full_name,
    phone: data.phone,
    addressLine: data.address_line,
    ward: data.ward,
    district: data.district,
    province: data.province,
    postalCode: data.postal_code,
    isDefault: data.is_default,
  });

  return res.data;
};


export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAddress,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};