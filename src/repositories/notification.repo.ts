import { prisma } from "@/lib/prisma";
import { CreateNotificationDTO, NotificationResponse } from "@/types/notification";
import { logger } from "@/lib/logger";

export class NotificationRepository {
  
 async create(data: CreateNotificationDTO): Promise<NotificationResponse> {
  try {
    const notification = await prisma.notification.create({
      data: {
        scanId: data.scanId,
        type: data.type,
        message: data.message,
        isRead: false,
      },
    });
    logger.debug("Notification created", { id: notification.id });
    return {
      id: notification.id,
      scanId: data.scanId,
      type: data.type,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  } catch (error) {
    logger.error("Failed to create notification", error);
    throw error;
  }
}

 
  async findAll(limit: number = 50): Promise<NotificationResponse[]> {
    try {
      const notifications = await prisma.notification.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
      });
      return notifications.map((n) => ({
        id: n.id,
        scanId: n.scanId,
        type: "scan_completed" as const,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt,
      }));
    } catch (error) {
      logger.error("Failed to fetch notifications", error);
      throw error;
    }
  }

  
  async countUnread(): Promise<number> {
    try {
      return await prisma.notification.count({
        where: { isRead: false },
      });
    } catch (error) {
      logger.error("Failed to count unread notifications", error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    try {
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
      logger.debug("Notification marked as read", { id: notificationId });
      return {
        id: notification.id,
        scanId: notification.scanId,
        type: "scan_completed" as const,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      };
    } catch (error) {
      logger.error("Failed to mark notification as read", error);
      throw error;
    }
  }

 
  async markAllAsRead(): Promise<number> {
    try {
      const result = await prisma.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
      logger.debug("All notifications marked as read", {
        count: result.count,
      });
      return result.count;
    } catch (error) {
      logger.error("Failed to mark all notifications as read", error);
      throw error;
    }
  }


  async delete(notificationId: string): Promise<void> {
    try {
      await prisma.notification.delete({
        where: { id: notificationId },
      });
      logger.debug("Notification deleted", { id: notificationId });
    } catch (error) {
      logger.error("Failed to delete notification", error);
      throw error;
    }
  }
}

export const notificationRepository = new NotificationRepository();
