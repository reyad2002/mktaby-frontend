"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Check,
  CheckCheck,
  X,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  getNotifications,
  getUnreadNotificationCount,
  updateNotificationById,
} from "../apis/notificationApi";
import type { NotificationDto } from "../types/notificationTypes";

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch unread count
  const { data: unreadCountResponse } = useQuery({
    queryKey: ["unreadNotificationCount"],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30000,
    refetchIntervalInBackground: false, // Prevent memory leak - don't refetch when tab is not visible
  });

  // Fetch notifications
  const { data: notificationsResponse, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications({ PageSize: 10, PageNumber: 1 }),
    enabled: isOpen, // Only fetch when dropdown is open
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => updateNotificationById(id, { isRead: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notificationsResponse?.data?.data?.filter(
        (n) => !n.isRead
      );
      if (unreadNotifications) {
        await Promise.all(
          unreadNotifications.map((n) =>
            updateNotificationById(n.id, { isRead: true })
          )
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = unreadCountResponse?.data ?? 0;
  const notifications = notificationsResponse?.data?.data ?? [];

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return date.toLocaleDateString("ar-EG");
  }, []);

  const handleNotificationClick = useCallback(
    (notification: NotificationDto) => {
      if (!notification.isRead) {
        markAsReadMutation.mutate(notification.id);
      }
    },
    [markAsReadMutation]
  );

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 hover:text-white hover:bg-[#17536e]/80 cursor-pointer  bg-[#17536e] text-white rounded-lg transition-colors border border-white/10"
        aria-label="الإشعارات"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-yellow-400 text-slate-900 rounded-full text-xs font-bold flex items-center justify-center shadow-lg shadow-yellow-900/30"
            aria-label={`${unreadCount} إشعارات غير مقروءة`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-lg font-semibold text-gray-100">الإشعارات</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1"
                  title="تحديد الكل كمقروء"
                >
                  {markAllAsReadMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCheck className="w-4 h-4" />
                  )}
                  قراءة الكل
                </button>
              )}
              <button
                onClick={closeDropdown}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-100 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Bell className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm">لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNotificationClick(notification)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleNotificationClick(notification);
                    }
                  }}
                  className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                    !notification.isRead ? "bg-yellow-400/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread indicator */}
                    <div className="mt-1.5">
                      {!notification.isRead ? (
                        <span className="block w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_0_3px_rgba(255,214,102,0.25)]" />
                      ) : (
                        <span className="block w-2 h-2 bg-gray-600 rounded-full" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          notification.isRead
                            ? "text-gray-300"
                            : "text-gray-100"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {notification.body}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>
                        {notification.targetURL && (
                          <Link
                            href={notification.targetURL}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
                          >
                            عرض
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Mark as read button */}
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsReadMutation.mutate(notification.id);
                        }}
                        disabled={markAsReadMutation.isPending}
                        className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-yellow-400"
                        title="تحديد كمقروء"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <Link
              href="/dashboard/notifications"
              className="block px-4 py-3 text-center text-sm text-yellow-400 hover:bg-white/5 transition-colors border-t border-white/10"
              onClick={closeDropdown}
            >
              عرض جميع الإشعارات
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(NotificationDropdown);
