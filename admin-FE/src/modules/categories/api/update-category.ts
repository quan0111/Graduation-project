import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API_URL_CATEGORY } from "@/constant/config";
import type { ICategory } from "../types";

export type UpdateCategoryDto = Partial<ICategory>;

interface UpdateCategoryResponse {
    data: ICategory;
    error: boolean;
    message: string;
    timestamp: string;
}

const updateCategory = async (
    id: string,
    data: UpdateCategoryDto,
): Promise<UpdateCategoryResponse> => {
    const res = await apiClient.patch(`${API_URL_CATEGORY}/${id}`, data);
    return res.data;
};

export const useUpdateCategory = (
    config?: UseMutationOptions<
        UpdateCategoryResponse,
        Error,
        { id: string; data: UpdateCategoryDto }
    >,
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["categories"],
            });
        },
        ...config,
    });
};
