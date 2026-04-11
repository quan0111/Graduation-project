import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_ADDRESS } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { IAddress } from "../types";

export const createAddress = async (data: IAddress): Promise<any> => {
    const response = await apiClient.post(`${API_URL_ADDRESS}`, data);
    return response.data.data;
};

type UseCreateAddressOptions = {
    config?: MutationConfig<typeof createAddress>;
};

export const useCreateAddress = ({
    config,
}: UseCreateAddressOptions = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createAddress,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["addresses"],
            });
        },
        ...config,
    });
};
