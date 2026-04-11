import { useQuery } from "@tanstack/react-query";
import { API_URL_CATEGORY } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { UseQueryOptions } from "@tanstack/react-query";

export interface Category {
    id: number;
    name: string;
    slug?: string;
    parentId?: number;
    parent?: Category;
    children?: Category[];
    productCount?: number;
    createdAt: string;
    updatedAt: string;
}

// Get all categories (tree structure)
export const getCategories = async (): Promise<Category[]> => {
    const response = await apiClient.get(API_URL_CATEGORY);
    return response.data;
};

export const useGetCategories = (
    config?: Omit<UseQueryOptions<Category[], Error>, "queryKey" | "queryFn">
) => {
    return useQuery<Category[], Error>({
        queryKey: ["categories"],
        queryFn: getCategories,
        ...config,
    });
};

// Get category by ID
export const getCategoryById = async (id: number): Promise<Category> => {
    const response = await apiClient.get(`${API_URL_CATEGORY}/${id}`);
    return response.data;
};

export const useGetCategoryById = (
    id: number,
    config?: Omit<UseQueryOptions<Category, Error>, "queryKey" | "queryFn">
) => {
    return useQuery<Category, Error>({
        queryKey: ["category", id],
        queryFn: () => getCategoryById(id),
        ...config,
    });
};

// Get category by slug
export const getCategoryBySlug = async (slug: string): Promise<Category> => {
    const response = await apiClient.get(`${API_URL_CATEGORY}/slug/${slug}`);
    return response.data;
};

export const useGetCategoryBySlug = (
    slug: string,
    config?: Omit<UseQueryOptions<Category, Error>, "queryKey" | "queryFn">
) => {
    return useQuery<Category, Error>({
        queryKey: ["category", slug],
        queryFn: () => getCategoryBySlug(slug),
        ...config,
    });
};

// Get products by category
export const getCategoryProducts = async (categoryId: number): Promise<any[]> => {
    const response = await apiClient.get(`${API_URL_CATEGORY}/${categoryId}/products`);
    return response.data;
};

export const useGetCategoryProducts = (
    categoryId: number,
    config?: Omit<UseQueryOptions<any[], Error>, "queryKey" | "queryFn">
) => {
    return useQuery<any[], Error>({
        queryKey: ["category", categoryId, "products"],
        queryFn: () => getCategoryProducts(categoryId),
        ...config,
    });
};

// Get child categories
export const getChildCategories = async (parentId: number): Promise<Category[]> => {
    const response = await apiClient.get(`${API_URL_CATEGORY}?parentId=${parentId}`);
    return response.data;
};

export const useGetChildCategories = (
    parentId: number,
    config?: Omit<UseQueryOptions<Category[], Error>, "queryKey" | "queryFn">
) => {
    return useQuery<Category[], Error>({
        queryKey: ["categories", parentId],
        queryFn: () => getChildCategories(parentId),
        ...config,
    });
};