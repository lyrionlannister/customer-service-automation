import { useState, useCallback } from "react";
import { useApiClient } from "@common/hooks/use-api-client";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDeviceHistoryEntry {
  brand: string;
  model: string;
  lastReceivedAt: string;
  controlNumber: number;
  notesCount: number;
}

export const useCustomers = () => {
  const { apiClient } = useApiClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [devices, setDevices] = useState<CustomerDeviceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient("/customers");
      if (!res.ok) throw new Error("Error al cargar clientes");
      setCustomers(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  const fetchDevices = useCallback(
    async (customerId: string) => {
      try {
        const res = await apiClient(`/customers/${customerId}/devices`);
        if (!res.ok) return;
        setDevices(await res.json());
      } catch {
        setDevices([]);
      }
    },
    [apiClient],
  );

  const create = useCallback(
    async (data: Pick<Customer, "name" | "phone" | "email">): Promise<Customer | null> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient("/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? "Error al crear cliente");
        }
        const created: Customer = await res.json();
        setCustomers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [apiClient],
  );

  const update = useCallback(
    async (id: string, data: Pick<Customer, "name" | "phone" | "email">): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient(`/customers/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? "Error al actualizar cliente");
        }
        const updated: Customer = await res.json();
        setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
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
        const res = await apiClient(`/customers/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error al eliminar cliente");
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return false;
      }
    },
    [apiClient],
  );

  return { customers, devices, loading, saving, error, fetchAll, fetchDevices, create, update, remove };
};
