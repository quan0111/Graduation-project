import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";

import { API_URL_ANALYTICS } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { TrackBehaviorPayload } from "@/modules/recommendation/types";

interface TrackBehaviorResponse {
  tracked: boolean;
}

const trackBehavior = async (payload: TrackBehaviorPayload): Promise<TrackBehaviorResponse> => {
  const response = await apiClient.post(`${API_URL_ANALYTICS}/track/me`, payload);
  return response.data;
};

export const useTrackBehavior = (
  config?: UseMutationOptions<TrackBehaviorResponse, Error, TrackBehaviorPayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation<TrackBehaviorResponse, Error, TrackBehaviorPayload>({
    mutationFn: trackBehavior,
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      config?.onSuccess?.(...args);
    },
  });
};
