import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL_REVIEW } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

export interface Review {
    id: number;
    rating: number;
    comment?: string;
    isVerifiedPurchase: boolean;
    userId: number;
    productId: number;
    createdAt: string;
    user?: {
        fullName: string;
        avatarUrl?: string;
    };
}

export interface CreateReviewRequest {
    productId: number;
    rating: number;
    comment?: string;
}

export interface UpdateReviewRequest {
    id: number;
    rating?: number;
    comment?: string;
}

// Get reviews by product
export const getReviewsByProduct = async (productId: number): Promise<Review[]> => {
    const response = await apiClient.get(`${API_URL_REVIEW}/product/${productId}`);
    return response.data;
};

export const useGetReviewsByProduct = (
    productId: number,
    config?: Omit<UseQueryOptions<Review[], Error>, "queryKey" | "queryFn">
) => {
    return useQuery<Review[], Error>({
        queryKey: ["reviews", productId],
        queryFn: () => getReviewsByProduct(productId),
        ...config,
    });
};

// Create review
export const createReview = async (data: CreateReviewRequest): Promise<Review> => {
    const response = await apiClient.post(API_URL_REVIEW, data);
    return response.data;
};

export const useCreateReview = ({ config }: { config?: MutationConfig<typeof createReview> } = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createReview,
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: ["reviews", variables.productId] });
        },
        ...config,
    });
};

// Update review
export const updateReview = async (data: UpdateReviewRequest): Promise<Review> => {
    const { id, ...updateData } = data;
    const response = await apiClient.put(`${API_URL_REVIEW}/${id}`, updateData);
    return response.data;
};

export const useUpdateReview = ({ config }: { config?: MutationConfig<typeof updateReview> } = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateReview,
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: ["reviews"] });
            await queryClient.invalidateQueries({ queryKey: ["product"] });
        },
        ...config,
    });
};

// Delete review
export const deleteReview = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_URL_REVIEW}/${id}`);
};

export const useDeleteReview = ({ config }: { config?: MutationConfig<typeof deleteReview> } = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteReview,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["reviews"] });
            await queryClient.invalidateQueries({ queryKey: ["product"] });
        },
        ...config,
    });
};

// Get user's review for a product
export const getUserReviewForProduct = async (userId: number, productId: number): Promise<Review | null> => {
    const response = await apiClient.get(`${API_URL_REVIEW}/user/${userId}/product/${productId}`);
    return response.data;
};

export const useGetUserReviewForProduct = (
    userId: number,
    productId: number,
    config?: Omit<UseQueryOptions<Review | null, Error>, "queryKey" | "queryFn">
) => {
    return useQuery<Review | null, Error>({
        queryKey: ["review", userId, productId],
        queryFn: () => getUserReviewForProduct(userId, productId),
        ...config,
    });
};