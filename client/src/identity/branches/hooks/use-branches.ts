import { useState, useCallback } from "react";
import { useApiClient } from "@common/hooks/use-api-client";

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useBranches = () => {
  const { apiClient } = useApiClient();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient("/branches");
      if (!res.ok) throw new Error("Error al cargar sucursales");
      setBranches(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  const create = useCallback(
    async (data: Pick<Branch, "name" | "address" | "phone">): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient("/branches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? "Error al crear sucursal");
        }
        const created: Branch = await res.json();
        setBranches((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
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
    async (id: string, data: Pick<Branch, "name" | "address" | "phone">): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient(`/branches/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? "Error al actualizar sucursal");
        }
        const updated: Branch = await res.json();
        setBranches((prev) => prev.map((b) => (b.id === id ? updated : b)));
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

  const setActive = useCallback(
    async (id: string, isActive: boolean): Promise<boolean> => {
      setError(null);
      try {
        const res = await apiClient(`/branches/${id}/active`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        });
        if (!res.ok) throw new Error("Error al actualizar sucursal");
        const updated: Branch = await res.json();
        setBranches((prev) => prev.map((b) => (b.id === id ? updated : b)));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return false;
      }
    },
    [apiClient],
  );

  return { branches, loading, saving, error, fetchAll, create, update, setActive };
};
