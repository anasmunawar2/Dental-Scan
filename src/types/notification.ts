export type NotificationType = "scan_completed" | "scan_failed" | "scan_started";

export interface CreateNotificationDTO {
  scanId: string;
  type: NotificationType;
  message: string;
}

export interface NotificationResponse {
  id: string;
  scanId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: Date;
}


export type Notification = {
  id: string;
  scanId: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};