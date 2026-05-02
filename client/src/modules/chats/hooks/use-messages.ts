import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "../../common/hooks/use-api-client";

export interface Message {
  id: number;
  sessionId: string;
  content: string;
  type: string;
  fromMe: boolean;
}

export function useMessages(sessionId: string | null) {
  const { apiClient } = useApiClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async (): Promise<void> => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError(null);
      const encoded = encodeURIComponent(sessionId);
      const response = await apiClient(`/chats/${encoded}`);
      if (!response.ok) {
        setError("No se pudieron cargar los mensajes.");
        return;
      }
      const data = (await response.json()) as Message[];
      setMessages(data);
    } catch {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [apiClient, sessionId]);

  useEffect(() => {
    setMessages([]);
    fetchMessages().catch(console.error);
  }, [fetchMessages]);

  useEffect(() => {
    if (!sessionId) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
    const eventSource = new EventSource(`${baseUrl}/whatsapp/events`);

    eventSource.addEventListener("message_received", (event) => {
      const payload = JSON.parse((event as MessageEvent).data) as { sessionId?: string };
      if (!payload.sessionId) return;
      if (payload.sessionId === sessionId || `${payload.sessionId}@c.us` === sessionId) {
        fetchMessages().catch(console.error);
      }
    });

    return () => eventSource.close();
  }, [fetchMessages, sessionId]);

  return { messages, loading, error };
}
