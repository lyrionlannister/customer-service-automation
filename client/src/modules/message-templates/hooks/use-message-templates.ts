import { useState, useCallback } from "react";
import { useApiClient } from "@common/hooks/use-api-client";

export interface MessageTemplate {
  id: string;
  key: string;
  text: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const authHeader = (): Record<string, string> => {
  const token = sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useMessageTemplates = () => {
  const { apiClient } = useApiClient();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient("/message-templates", { headers: authHeader() });
      if (!res.ok) throw new Error("Error al cargar templates");
      setTemplates(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  const create = useCallback(
    async (data: Pick<MessageTemplate, "key" | "text" | "description">): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient("/message-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? "Error al crear template");
        }
        const created: MessageTemplate = await res.json();
        setTemplates((prev) => [...prev, created].sort((a, b) => a.key.localeCompare(b.key)));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [apiClient],
  );

  const update = useCallback(
    async (id: string, data: Pick<MessageTemplate, "text" | "description">): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient(`/message-templates/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Error al actualizar template");
        const updated: MessageTemplate = await res.json();
        setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [apiClient],
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      setError(null);
      try {
        const res = await apiClient(`/message-templates/${id}`, {
          method: "DELETE",
          headers: authHeader(),
        });
        if (!res.ok) throw new Error("Error al eliminar template");
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return false;
      }
    },
    [apiClient],
  );

  return { templates, loading, saving, error, fetchAll, create, update, remove };
};
