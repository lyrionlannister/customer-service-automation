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

  return { messages, loading, error };
}
