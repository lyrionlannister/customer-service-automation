import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "../../common/hooks/use-api-client";

export interface Conversation {
  sessionId: string;
  phone: string;
  contactName?: string;
  lastId: number;
  messageCount: number;
  lastContent: string;
  lastType: string;
}

export function useConversations() {
  const { apiClient } = useApiClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient("/chats");
      if (!response.ok) {
        setError("No se pudieron cargar las conversaciones.");
        return;
      }
      const data = (await response.json()) as Conversation[];
      setConversations(data);
    } catch {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    fetchConversations().catch(console.error);
  }, [fetchConversations]);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
    const eventSource = new EventSource(`${baseUrl}/whatsapp/events`);
    const refresh = () => {
      fetchConversations().catch(console.error);
    };

    eventSource.addEventListener("message_received", refresh);
    eventSource.addEventListener("ready", refresh);
    eventSource.addEventListener("disconnected", refresh);

    return () => eventSource.close();
  }, [fetchConversations]);

  return { conversations, loading, error, refetch: fetchConversations };
}
