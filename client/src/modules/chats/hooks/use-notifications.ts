import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "../../common/hooks/use-api-client";

export interface AppNotification {
  id: number;
  type: "conversation_transferred" | "new_human_message";
  sessionId: string;
  phone: string;
  contactName?: string;
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  const { apiClient } = useApiClient();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async (): Promise<void> => {
    try {
      const res = await apiClient("/notifications");
      if (!res.ok) return;
      const data = (await res.json()) as AppNotification[];
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch {
      // silencioso
    }
  }, [apiClient]);

  useEffect(() => {
    fetchNotifications().catch(console.error);
  }, [fetchNotifications]);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
    const eventSource = new EventSource(`${baseUrl}/whatsapp/events`);
    eventSource.addEventListener("conversation_transferred", () => {
      fetchNotifications().catch(console.error);
    });
    return () => eventSource.close();
  }, [fetchNotifications]);

  const markRead = useCallback(
    async (id: number): Promise<void> => {
      try {
        await apiClient(`/notifications/${id}/read`, { method: "PATCH" });
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // silencioso
      }
    },
    [apiClient],
  );

  const markAllRead = useCallback(async (): Promise<void> => {
    try {
      await apiClient("/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // silencioso
    }
  }, [apiClient]);

  return { notifications, unreadCount, markRead, markAllRead, refetch: fetchNotifications };
}
