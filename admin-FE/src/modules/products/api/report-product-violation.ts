import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_URL_MODERATION } from "@/constant/config";
import { apiClient } from "@/lib/api";

export const reportProductViolation = async ({
  id,
  status,
  reason,
}: {
  id: number;
  status: "BANNED" | "REJECT";
  reason: string;
}) => {
  const res = await apiClient.post(`${API_URL_MODERATION}/products/${id}/violation`, {
    status,
    reason,
  });
  return res.data;
};

export const useReportProductViolation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportProductViolation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["moderation-cases"] });
    },
  });
};
