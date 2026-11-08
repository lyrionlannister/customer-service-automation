import { useState, useCallback } from "react";
import { useApiClient } from "@common/hooks/use-api-client";

export type QuoteStatus = "pending" | "accepted" | "rejected";

export interface QuoteRecord {
  id: string;
  localId: string;
  customerName: string;
  contactNumber: string | null;
  totalValue: number;
  validUntil: string | null;
  status: QuoteStatus;
  createdByEmployeeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItemInput {
  inventoryItemId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface QuoteItemRecord extends QuoteItemInput {
  id: string;
}

export interface QuoteFormData {
  localId: string;
  customerName: string;
  contactNumber: string;
  validUntil: string;
  createdByEmployeeId: string;
}

const toPayload = (form: QuoteFormData) => ({
  localId: form.localId,
  customerName: form.customerName,
  contactNumber: form.contactNumber || undefined,
  validUntil: form.validUntil || undefined,
  createdByEmployeeId: form.createdByEmployeeId || undefined,
});

export const useQuotes = () => {
  const { apiClient } = useApiClient();
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [quote, setQuote] = useState<QuoteRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient("/quotes");
      if (!res.ok) throw new Error("Error al obtener cotizaciones");
      setQuotes(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  const fetchQuote = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient(`/quotes/${id}`);
        if (!res.ok) throw new Error("Error al obtener cotización");
        const data = (await res.json()) as QuoteRecord;
        setQuote(data);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiClient],
  );

  const fetchQuoteItems = useCallback(
    async (id: string): Promise<QuoteItemRecord[]> => {
      try {
        const res = await apiClient(`/quotes/${id}/items`);
        if (!res.ok) return [];
        return (await res.json()) as QuoteItemRecord[];
      } catch {
        return [];
      }
    },
    [apiClient],
  );

  const createQuote = useCallback(
    async (form: QuoteFormData, items: QuoteItemInput[]): Promise<QuoteRecord | null> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient("/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...toPayload(form), items }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string | string[] }).error?.toString() ?? "Error al crear cotización");
        }
        return (await res.json()) as QuoteRecord;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [apiClient],
  );

  const updateQuote = useCallback(
    async (id: string, form: QuoteFormData, items: QuoteItemInput[]): Promise<QuoteRecord | null> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient(`/quotes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...toPayload(form), items }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string | string[] }).error?.toString() ?? "Error al actualizar cotización");
        }
        return (await res.json()) as QuoteRecord;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [apiClient],
  );

  const setStatus = useCallback(
    async (id: string, status: QuoteStatus): Promise<boolean> => {
      setError(null);
      try {
        const res = await apiClient(`/quotes/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Error al actualizar estado");
        const updated: QuoteRecord = await res.json();
        setQuotes((prev) => prev.map((q) => (q.id === id ? updated : q)));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return false;
      }
    },
    [apiClient],
  );

  const deleteQuote = useCallback(
    async (id: string): Promise<boolean> => {
      setError(null);
      try {
        const res = await apiClient(`/quotes/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error al eliminar cotización");
        setQuotes((prev) => prev.filter((q) => q.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return false;
      }
    },
    [apiClient],
  );

  return {
    quotes,
    quote,
    loading,
    saving,
    error,
    fetchQuotes,
    fetchQuote,
    fetchQuoteItems,
    createQuote,
    updateQuote,
    setStatus,
    deleteQuote,
    clearError: () => setError(null),
  };
};
