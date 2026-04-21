import { notificationRepository } from "@/repositories/notification.repo";
import { CreateNotificationDTO, NotificationResponse } from "@/types/notification";
import { logger } from "@/lib/logger";

export class NotificationService {
 
  async createNotification(
    data: CreateNotificationDTO
  ): Promise<NotificationResponse> {
    logger.debug("Creating notification", data);
    return notificationRepository.create(data);
  }


  async getNotifications(limit?: number): Promise<NotificationResponse[]> {
    logger.debug("Fetching notifications");
    return notificationRepository.findAll(limit);
  }

 
  async getUnreadCount(): Promise<number> {
    logger.debug("Getting unread count");
    return notificationRepository.countUnread();
  }

  
  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    logger.debug("Marking notification as read", { id: notificationId });
    return notificationRepository.markAsRead(notificationId);
  }


  async markAllAsRead(): Promise<number> {
    logger.debug("Marking all notifications as read");
    return notificationRepository.markAllAsRead();
  }

  async deleteNotification(notificationId: string): Promise<void> {
    logger.debug("Deleting notification", { id: notificationId });
    return notificationRepository.delete(notificationId);
  }
}

export const notificationService = new NotificationService();
