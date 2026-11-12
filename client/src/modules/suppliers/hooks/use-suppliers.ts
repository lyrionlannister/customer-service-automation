import { useState, useCallback } from "react";
import { useApiClient } from "@common/hooks/use-api-client";

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

const authHeader = (): Record<string, string> => {
  const token = sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useSuppliers = () => {
  const { apiClient } = useApiClient();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient("/suppliers", { headers: authHeader() });
      if (!res.ok) throw new Error("Error al cargar proveedores");
      setSuppliers(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  const create = useCallback(
    async (data: Pick<Supplier, "name" | "phone">): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient("/suppliers", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? "Error al crear proveedor");
        }
        const created: Supplier = await res.json();
        setSuppliers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
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
    async (id: string, data: Pick<Supplier, "name" | "phone">): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient(`/suppliers/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? "Error al actualizar proveedor");
        }
        const updated: Supplier = await res.json();
        setSuppliers((prev) => prev.map((supplier) => (supplier.id === id ? updated : supplier)));
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
        const res = await apiClient(`/suppliers/${id}`, {
          method: "DELETE",
          headers: authHeader(),
        });
        if (!res.ok) throw new Error("Error al eliminar proveedor");
        setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return false;
      }
    },
    [apiClient],
  );

  return { suppliers, loading, saving, error, fetchAll, create, update, remove };
};
