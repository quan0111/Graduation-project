import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL_NOTIFICATION } from "@/constant/config";
import { apiClient } from "@/lib/api";
import { useMe } from "@/modules/auth/api/get-auth-me";
import type { MutationConfig } from "@/lib/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

export interface Notification {
    id: number;
    userId: number;
    title: string;
    content: string;
    type:
        | "ORDER_UPDATE"
        | "PAYMENT_UPDATE"
        | "RETURN_UPDATE"
        | "REFUND_UPDATE"
        | "PROMOTION"
        | "SYSTEM"
        | "CHAT"
        | "PRODUCT_BANNED"
        | "SUPPORT_TICKET";
    isRead: boolean;
    metadata?: any;
    createdAt: string;
}

export interface CreateNotificationRequest {
    userId: number;
    title: string;
    content: string;
    type: Notification["type"];
    metadata?: any;
}

export interface UpdateNotificationRequest {
    id: number;
    isRead?: boolean;
    title?: string;
    content?: string;
}

// Get all notifications
export const getNotifications = async (): Promise<Notification[]> => {
    const response = await apiClient.get(API_URL_NOTIFICATION);
    return response.data;
};

export const useGetNotifications = (
    config?: Omit<UseQueryOptions<Notification[], Error>, "queryKey" | "queryFn">
) => {
    const { data: user } = useMe();
    return useQuery<Notification[], Error>({
        queryKey: ["notifications", user?.id],
        queryFn: getNotifications,
        enabled: !!user?.id && (config?.enabled ?? true),
        ...config,
    });
};

// Get unread notifications count
export const getUnreadCount = async (): Promise<{ count: number }> => {
    const response = await apiClient.get(`${API_URL_NOTIFICATION}/unread/count`);
    return response.data;
};

export const useGetUnreadCount = (
    config?: Omit<UseQueryOptions<{ count: number }, Error>, "queryKey" | "queryFn">
) => {
    const { data: user } = useMe();
    return useQuery<{ count: number }, Error>({
        queryKey: ["notifications", user?.id, "unread", "count"],
        queryFn: getUnreadCount,
        enabled: !!user?.id && (config?.enabled ?? true),
        ...config,
    });
};

// Mark notification as read
export const markAsRead = async (id: number): Promise<Notification> => {
    const response = await apiClient.patch(`${API_URL_NOTIFICATION}/${id}/read`);
    return response.data;
};

export const useMarkAsRead = ({ config }: { config?: MutationConfig<typeof markAsRead> } = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAsRead,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["notifications"] });
            await queryClient.invalidateQueries({ queryKey: ["notifications", "unread", "count"] });
        },
        ...config,
    });
};

// Mark all notifications as read
export const markAllAsRead = async (): Promise<void> => {
    await apiClient.patch(`${API_URL_NOTIFICATION}/read-all`);
};

export const useMarkAllAsRead = ({ config }: { config?: MutationConfig<typeof markAllAsRead> } = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAllAsRead,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["notifications"] });
            await queryClient.invalidateQueries({ queryKey: ["notifications", "unread", "count"] });
        },
        ...config,
    });
};

// Delete notification
export const deleteNotification = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_URL_NOTIFICATION}/${id}`);
};

export const useDeleteNotification = ({ config }: { config?: MutationConfig<typeof deleteNotification> } = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteNotification,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["notifications"] });
            await queryClient.invalidateQueries({ queryKey: ["notifications", "unread", "count"] });
        },
        ...config,
    });
};

// Get notifications by type
export const getNotificationsByType = async (type: string): Promise<Notification[]> => {
    const response = await apiClient.get(`${API_URL_NOTIFICATION}?type=${type}`);
    return response.data;
};

export const useGetNotificationsByType = (
    type: string,
    config?: Omit<UseQueryOptions<Notification[], Error>, "queryKey" | "queryFn">
) => {
    return useQuery<Notification[], Error>({
        queryKey: ["notifications", type],
        queryFn: () => getNotificationsByType(type),
        ...config,
    });
};
