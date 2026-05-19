import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL_CATEGORY } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { ICategory } from "../types";
import { toast } from "sonner";

export const createCategory = async (data: ICategory): Promise<any> => {
    const response = await apiClient.post(`${API_URL_CATEGORY}`, data);
    return response.data?.data ?? response.data;
};

type UseCreateCategoryOptions = {
    config?: MutationConfig<typeof createCategory>;
};

export const useCreateCategory = ({
    config,
}: UseCreateCategoryOptions = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCategory,
        onMutate: () => {},
        onError: (error: any) => {
            toast.error(error?.response?.data?.detail || "Tạo danh mục thất bại ❌");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["categories"],
            });
        },
        ...config,
    });
};
