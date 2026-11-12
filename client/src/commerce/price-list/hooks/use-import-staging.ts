import { useState, useCallback } from "react";
import { useApiClient } from "@common/hooks/use-api-client";

export type StagingStatus = "processing" | "ready" | "error";

export interface StagingRow {
  brand: string;
  model: string;
  price: number;
}

export interface StagingRecord {
  importId: string;
  tenantId: string;
  supplierId: string;
  status: StagingStatus;
  rows: StagingRow[];
  error?: string;
  createdAt: string;
}

const authHeader = (): Record<string, string> => {
  const token = sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useImportStaging = () => {
  const { apiClient } = useApiClient();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File, supplierId: string): Promise<string | null> => {
      setUploading(true);
      setError(null);
      try {
        const buffer = await file.arrayBuffer();
        const res = await apiClient(
          `/import-staging/upload?supplierId=${encodeURIComponent(supplierId)}&fileName=${encodeURIComponent(file.name)}`,
          {
            method: "POST",
            headers: { "Content-Type": file.type || "application/octet-stream", ...authHeader() },
            body: buffer,
          },
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? "Error al subir el archivo");
        }
        const data = (await res.json()) as { importId: string };
        return data.importId;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return null;
      } finally {
        setUploading(false);
      }
    },
    [apiClient],
  );

  const fetchById = useCallback(
    async (importId: string): Promise<StagingRecord | null> => {
      try {
        const res = await apiClient(`/import-staging/${importId}`, { headers: authHeader() });
        if (!res.ok) return null;
        return (await res.json()) as StagingRecord;
      } catch {
        return null;
      }
    },
    [apiClient],
  );

  const updateRows = useCallback(
    async (importId: string, rows: StagingRow[]): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient(`/import-staging/${importId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify({ rows }),
        });
        if (!res.ok) throw new Error("Error al guardar los cambios");
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

  const commit = useCallback(
    async (importId: string): Promise<{ imported: number } | null> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient(`/import-staging/${importId}/commit`, {
          method: "POST",
          headers: authHeader(),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? "Error al confirmar la importación");
        }
        return (await res.json()) as { imported: number };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [apiClient],
  );

  const discard = useCallback(
    async (importId: string): Promise<boolean> => {
      try {
        const res = await apiClient(`/import-staging/${importId}`, {
          method: "DELETE",
          headers: authHeader(),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
    [apiClient],
  );

  return { uploading, saving, error, upload, fetchById, updateRows, commit, discard, clearError: () => setError(null) };
};
