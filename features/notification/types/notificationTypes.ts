export type GetNotificationsQuery = {
  PageNumber?: number; // int32
  PageSize?: number; // int32
  Search?: string;
  Sort?: string;
  IsDeleted?: boolean;
};

export type NotificationDto = {
  id: number;
  title: string;
  body: string;
  targetURL: string;
  deepLink: string;
  isRead: boolean;
  createdAt: string; // ISO date-time
};

export type PaginatedNotifications = {
  pageNumber: number;
  pageSize: number;
  count: number;
  data: NotificationDto[];
};

export type ApiResponse<T> = {
  succeeded: boolean;
  message: string;
  data: T;
};

export type GetNotificationsResponse = ApiResponse<PaginatedNotifications>;

export type PatchNotificationsResponse = ApiResponse<boolean>;

export type GetUnreadNotificationCountResponse = ApiResponse<number>;

export type PatchNotificationByIdResponse = ApiResponse<boolean>;

// Request type for updating notification
export type UpdateNotificationRequest = {
  isRead?: boolean;
  isDeleted?: boolean;
};
