import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/services/notification.service";
import { logger } from "@/lib/logger";
import { asyncHandler } from "@/utils/asyncHandler";


export const GET = asyncHandler(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const notifications = await notificationService.getNotifications(limit);
    const unreadCount = await notificationService.getUnreadCount();

    logger.debug("Fetched notifications", { count: notifications.length });

    return NextResponse.json(
      {
        notifications,
        unreadCount,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error fetching notifications", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
});


export const PATCH = asyncHandler(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { action, notificationId } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required (markAsRead, markAllAsRead, or delete)" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "markAsRead":
        if (!notificationId) {
          return NextResponse.json(
            { error: "notificationId is required for markAsRead" },
            { status: 400 }
          );
        }
        result = await notificationService.markAsRead(notificationId);
        logger.info("Notification marked as read", { notificationId });
        return NextResponse.json({ success: true, notification: result });

      case "markAllAsRead":
        result = await notificationService.markAllAsRead();
        logger.info("All notifications marked as read", { count: result });
        return NextResponse.json({ success: true, count: result });

      case "delete":
        if (!notificationId) {
          return NextResponse.json(
            { error: "notificationId is required for delete" },
            { status: 400 }
          );
        }
        await notificationService.deleteNotification(notificationId);
        logger.info("Notification deleted", { notificationId });
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use markAsRead, markAllAsRead, or delete" },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error("Error updating notification", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
});
