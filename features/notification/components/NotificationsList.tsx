"use client";

import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Check,
  CheckCheck,
  Search,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import {
  getNotifications,
  updateNotificationById,
} from "../apis/notificationApi";
import type {
  NotificationDto,
  GetNotificationsQuery,
} from "../types/notificationTypes";
import PageHeader from "@/shared/components/dashboard/PageHeader";

const DEFAULT_FILTERS: GetNotificationsQuery = {
  PageNumber: 1,
  PageSize: 20,
  Search: "",
  Sort: "",
  IsDeleted: false,
};

const NotificationsList: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] =
    useState<GetNotificationsQuery>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [filterType, setFilterType] = useState<"all" | "unread" | "read">(
    "all"
  );

  // Fetch notifications
  const {
    data: notificationsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["notifications", filters],
    queryFn: () => getNotifications(filters),
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
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      await Promise.all(
        unreadNotifications.map((n) =>
          updateNotificationById(n.id, { isRead: true })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });

  // Handle search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, Search: searchInput, PageNumber: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const notifications = notificationsResponse?.data?.data ?? [];
  const totalCount = notificationsResponse?.data?.count ?? 0;
  const pageSize = filters.PageSize ?? 20;
  const currentPage = filters.PageNumber ?? 1;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Filter by read status - memoized
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (filterType === "unread") return !notification.isRead;
      if (filterType === "read") return notification.isRead;
      return true;
    });
  }, [notifications, filterType]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

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
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="الإشعارات"
        subtitle="إدارة ومتابعة جميع الإشعارات الخاصة بك"
        icon={Bell}
        isFetching={isFetching}
        countLabel={`${totalCount} إشعار`}
        onRefresh={() => refetch()}
      >
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 text-yellow-700 text-sm border border-yellow-200">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            {unreadCount} غير مقروء
          </span>
        )}
      </PageHeader>

      {/* Filters Section */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-50">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="بحث في الإشعارات..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pr-10 pl-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterType("unread")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === "unread"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              غير مقروء
            </button>
            <button
              onClick={() => setFilterType("read")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === "read"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              مقروء
            </button>
          </div>

          {/* Mark All as Read */}
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {markAllAsReadMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              قراءة الكل
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Bell className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">لا توجد إشعارات</p>
            <p className="text-sm">
              {filterType === "unread"
                ? "لا توجد إشعارات غير مقروءة"
                : filterType === "read"
                ? "لا توجد إشعارات مقروءة"
                : "لم تتلق أي إشعارات بعد"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={() => markAsReadMutation.mutate(notification.id)}
                isMarking={markAsReadMutation.isPending}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              عرض {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, totalCount)} من {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    PageNumber: Math.max(1, currentPage - 1),
                  }))
                }
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                السابق
              </button>
              <span className="text-sm text-gray-600">
                صفحة {currentPage} من {totalPages}
              </span>
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    PageNumber: Math.min(totalPages, currentPage + 1),
                  }))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Notification Item Component
interface NotificationItemProps {
  notification: NotificationDto;
  onMarkAsRead: () => void;
  isMarking: boolean;
  formatDate: (date: string) => string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  isMarking,
  formatDate,
}) => {
  return (
    <div
      className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
        !notification.isRead ? "bg-blue-50/50" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`mt-1 p-2 rounded-full ${
            notification.isRead ? "bg-gray-100" : "bg-blue-100"
          }`}
        >
          <Bell
            className={`w-5 h-5 ${
              notification.isRead ? "text-gray-500" : "text-blue-600"
            }`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3
                className={`text-base font-medium ${
                  notification.isRead ? "text-gray-700" : "text-gray-900"
                }`}
              >
                {notification.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {!notification.isRead && (
                <button
                  onClick={onMarkAsRead}
                  disabled={isMarking}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="تحديد كمقروء"
                >
                  <Check className="w-5 h-5" />
                </button>
              )}
              {notification.targetURL && (
                <Link
                  href={notification.targetURL}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="عرض التفاصيل"
                >
                  <ExternalLink className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-3">
            <span className="text-xs text-gray-500">
              {formatDate(notification.createdAt)}
            </span>
            {!notification.isRead && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                جديد
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(NotificationsList);
