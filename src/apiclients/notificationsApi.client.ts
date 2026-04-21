import { API_ROUTES } from "../constants/apiRoutes";
import { get, patch } from "../constants/httpClients";

export async function fetchNotifications() {
  return get<{ notifications: any[] }>(API_ROUTES.NOTIFICATIONS);
}

export async function markNotificationAsRead(notificationId: string) {
  return patch(API_ROUTES.NOTIFICATIONS, {
    action: "markAsRead",
    notificationId,
  });
}