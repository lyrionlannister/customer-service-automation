import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "../../../core/common/hooks/use-api-client";
import { authenticatedEventSourceUrl } from "../../../core/common/utils/auth-header";

export function useHumanMode(sessionId: string | null) {
  const { apiClient } = useApiClient();
  const [isHumanMode, setIsHumanMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [toggling, setToggling] = useState(false);

  const fetchStatus = useCallback(async (): Promise<void> => {
    if (!sessionId) {
      setIsHumanMode(false);
      return;
    }
    try {
      const encoded = encodeURIComponent(sessionId);
      const res = await apiClient(`/chats/${encoded}/transfer`);
      if (res.ok) {
        const data = (await res.json()) as { isHumanMode: boolean };
        setIsHumanMode(data.isHumanMode);
      }
    } catch {
      // silencioso
    }
  }, [apiClient, sessionId]);

  useEffect(() => {
    fetchStatus().catch(console.error);
  }, [fetchStatus]);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
    const eventSource = new EventSource(authenticatedEventSourceUrl(`${baseUrl}/whatsapp/events`));
    eventSource.addEventListener("conversation_transferred", (event) => {
      const payload = JSON.parse((event as MessageEvent).data) as { sessionId?: string };
      if (payload.sessionId === sessionId) {
        setIsHumanMode(true);
      }
    });
    return () => eventSource.close();
  }, [sessionId]);

  const activate = useCallback(async (): Promise<void> => {
    if (!sessionId) return;
    setToggling(true);
    try {
      const encoded = encodeURIComponent(sessionId);
      await apiClient(`/chats/${encoded}/transfer`, { method: "POST" });
      setIsHumanMode(true);
    } finally {
      setToggling(false);
    }
  }, [apiClient, sessionId]);

  const deactivate = useCallback(async (): Promise<void> => {
    if (!sessionId) return;
    setToggling(true);
    try {
      const encoded = encodeURIComponent(sessionId);
      await apiClient(`/chats/${encoded}/transfer`, { method: "DELETE" });
      setIsHumanMode(false);
    } finally {
      setToggling(false);
    }
  }, [apiClient, sessionId]);

  const sendMessage = useCallback(
    async (body: string): Promise<boolean> => {
      if (!sessionId || !body.trim()) return false;
      setSending(true);
      try {
        const encoded = encodeURIComponent(sessionId);
        const res = await apiClient(`/chats/${encoded}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        });
        return res.ok;
      } finally {
        setSending(false);
      }
    },
    [apiClient, sessionId],
  );

  return { isHumanMode, toggling, sending, activate, deactivate, sendMessage };
}
