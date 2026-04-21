import React, { useEffect, useState } from "react";
import { NotificationsPanelProps } from "@/types/notificationPanelProps";

export default function NotificationsPanel({
  notifications: initialNotifications,
  onClose,
  onMarkAsRead,
  fetchNotifications,
}: NotificationsPanelProps & { fetchNotifications?: () => Promise<any[]> }) {
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleMarkAsRead = async (id: string) => {
    setLoadingIds((prev) => [...prev, id]);
    try {
      await onMarkAsRead(id);
      if (fetchNotifications) {
        const fresh = await fetchNotifications();
        setNotifications(fresh || []);
      }
    } finally {
      setLoadingIds((prev) => prev.filter((nid) => nid !== id));
    }
  };

  return (
    <div className="absolute top-16 right-32 bg-zinc-800 border border-zinc-700 rounded shadow-lg w-80 max-h-96 overflow-y-auto z-50">
      <div className="p-2 border-b border-zinc-700 font-bold text-blue-300 flex justify-between items-center">
        Notifications
        <button className="text-xs text-gray-400" onClick={onClose}>
          Close
        </button>
      </div>
      {notifications?.length === 0 ? (
        <div className="p-4 text-gray-400 text-sm">No notifications</div>
      ) : (
        notifications?.map((n) => (
          <div
            key={n.id}
            className={`p-3 border-b border-zinc-700 text-sm flex justify-between items-center ${
              n.isRead ? "opacity-60" : ""
            }`}
          >
            <div>
              <div className="font-semibold">{n.type.replace("_", " ")}</div>
              <div>{n.message}</div>
              <div className="text-xs text-gray-400">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
            {!n.isRead && (
              <button
                className={`ml-2 px-2 py-1 rounded text-xs ${
                  loadingIds.includes(n.id)
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-green-700"
                }`}
                onClick={() => handleMarkAsRead(n.id)}
                disabled={loadingIds.includes(n.id)}
              >
                {loadingIds.includes(n.id) ? "Marking..." : "Mark as read"}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
