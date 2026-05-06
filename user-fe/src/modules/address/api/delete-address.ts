import { API_URL_ADDRESS } from "@/constant/config";
import { apiClient } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";


// ===== API =====
const deleteAddress = async (address_id: number) => {
  const res = await apiClient.delete(
    `${API_URL_ADDRESS}/${address_id}`
  );
  return res.data;
};


// ===== HOOK =====
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAddress,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};