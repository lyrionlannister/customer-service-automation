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

  return { conversations, loading, error, refetch: fetchConversations };
}
