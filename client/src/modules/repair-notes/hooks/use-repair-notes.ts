import { useState, useCallback } from "react";
import { useApiClient } from "@common/hooks/use-api-client";
import type { RepairNoteRecord, RepairNoteFormData } from "../types/repair-note.types";

const getAuthHeader = (): Record<string, string> => {
  const token = sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const toPayload = (form: RepairNoteFormData) => ({
  ...form,
  totalValue: parseFloat(form.totalValue) || 0,
  advanceValue: form.advanceValue ? parseFloat(form.advanceValue) : undefined,
  extendedWarrantyDays: form.extendedWarrantyDays
    ? parseInt(form.extendedWarrantyDays, 10)
    : undefined,
  deliveryDate: form.deliveryDate || undefined,
  contactNumber: form.contactNumber || undefined,
  technicianNotes: form.technicianNotes || undefined,
  technicianName: form.technicianName || undefined,
});

export const useRepairNotes = () => {
  const { apiClient } = useApiClient();
  const [notes, setNotes] = useState<RepairNoteRecord[]>([]);
  const [note, setNote] = useState<RepairNoteRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient("/repair-notes", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al obtener notas");
      const data = (await response.json()) as RepairNoteRecord[];
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  const fetchNote = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient(`/repair-notes/${id}`, {
          headers: getAuthHeader(),
        });
        if (!response.ok) throw new Error("Error al obtener nota");
        const data = (await response.json()) as RepairNoteRecord;
        setNote(data);
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

  const createNote = useCallback(
    async (form: RepairNoteFormData): Promise<RepairNoteRecord | null> => {
      setSaving(true);
      setError(null);
      try {
        const response = await apiClient("/repair-notes", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(toPayload(form)),
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(data?.error || "Error al crear nota");
        }
        return (await response.json()) as RepairNoteRecord;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [apiClient],
  );

  const updateNote = useCallback(
    async (id: string, form: RepairNoteFormData): Promise<RepairNoteRecord | null> => {
      setSaving(true);
      setError(null);
      try {
        const response = await apiClient(`/repair-notes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(toPayload(form)),
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(data?.error || "Error al actualizar nota");
        }
        return (await response.json()) as RepairNoteRecord;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [apiClient],
  );

  const deleteNote = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await apiClient(`/repair-notes/${id}`, {
          method: "DELETE",
          headers: getAuthHeader(),
        });
        if (!response.ok) throw new Error("Error al eliminar nota");
        setNotes((prev) => prev.filter((n) => n.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return false;
      }
    },
    [apiClient],
  );

  return {
    notes,
    note,
    loading,
    saving,
    error,
    fetchNotes,
    fetchNote,
    createNote,
    updateNote,
    deleteNote,
    clearError: () => setError(null),
  };
};
