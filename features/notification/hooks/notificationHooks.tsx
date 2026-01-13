import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  getNotifications,
  getUnreadNotificationCount,
  updateNotificationById,
} from "../apis/notificationApi";

import type {
  GetNotificationsQuery,
  UpdateNotificationRequest,
} from "../types/notificationTypes";

// ===========================
// Query Keys
// ===========================
export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filters: GetNotificationsQuery) =>
    [...notificationKeys.lists(), filters] as const,
  unreadCount: ["unreadNotificationCount"] as const,
};

// ===========================
// Query Hooks
// ===========================

/**
 * Fetch paginated notifications list
 */
export function useNotifications(filters: GetNotificationsQuery = {}) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => getNotifications(filters),
    staleTime: 10_000,
  });
}

/**
 * Fetch unread notification count
 */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });
}

// ===========================
// Mutation Hooks
// ===========================

/**
 * Mark notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateNotificationRequest;
    }) => updateNotificationById(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "حدث خطأ أثناء تحديث الإشعار"
      );
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notifications: { id: number }[]) => {
      const unread = notifications.filter((n) => n);
      await Promise.all(
        unread.map((n) => updateNotificationById(n.id, { isRead: true }))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
      toast.success("تم تحديد جميع الإشعارات كمقروءة");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "حدث خطأ أثناء تحديث الإشعارات"
      );
    },
  });
}
