import * as PATHES from "../PATHES";
import * as TYPES from "../types/notificationTypes";
import apiClient from "@/lib/apiClient";

// Get All Notifications
export async function getNotifications(
  params: TYPES.GetNotificationsQuery = {}
): Promise<TYPES.GetNotificationsResponse> {
  const response = await apiClient.get<TYPES.GetNotificationsResponse>(
    PATHES.NOTIFICATION_PATH,
    {
      params,
    }
  );
  return response.data;
}
// Get Unread Notification Count
export async function getUnreadNotificationCount(): Promise<TYPES.GetUnreadNotificationCountResponse> {
  const response =
    await apiClient.get<TYPES.GetUnreadNotificationCountResponse>(
      PATHES.GET_UNREAD_NOTIFICATION_COUNT_PATH
    );
  return response.data;
}
// Update Notification by ID
export async function updateNotificationById(
  id: number,
  payload: TYPES.UpdateNotificationRequest
): Promise<TYPES.PatchNotificationByIdResponse> {
  const response = await apiClient.put<TYPES.PatchNotificationByIdResponse>(
    PATHES.UPDATE_NOTIFICATION_BY_ID_PATH.replace("{id}", id.toString()),
    payload
  );
  return response.data;
}
