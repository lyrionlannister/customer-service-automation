import { useState, useCallback } from "react";
import { useApiClient } from "@common/hooks/use-api-client";

export type InventoryItemKind = "accessory" | "part";

export interface InventoryItem {
  id: string;
  localId: string;
  name: string;
  sku: string | null;
  kind: InventoryItemKind;
  costPrice: number;
  salePrice: number;
  quantityOnHand: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  inventoryItemId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string | null;
  relatedEntityType: "sale" | "repair_note" | "manual";
  createdByEmployeeId: string | null;
  createdAt: string;
}

type CreateItemPayload = Omit<InventoryItem, "id" | "quantityOnHand" | "createdAt" | "updatedAt">;

export const useInventory = () => {
  const { apiClient } = useApiClient();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient("/inventory");
      if (!res.ok) throw new Error("Error al cargar inventario");
      setItems(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  const create = useCallback(
    async (data: CreateItemPayload): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient("/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? "Error al crear item");
        }
        const created: InventoryItem = await res.json();
        setItems((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
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
    async (id: string, data: Partial<CreateItemPayload>): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient(`/inventory/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Error al actualizar item");
        const updated: InventoryItem = await res.json();
        setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
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
        const res = await apiClient(`/inventory/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error al eliminar item");
        setItems((prev) => prev.filter((i) => i.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return false;
      }
    },
    [apiClient],
  );

  const bulkImport = useCallback(
    async (file: File, localId: string): Promise<{ imported: number } | null> => {
      setSaving(true);
      setError(null);
      try {
        const buffer = await file.arrayBuffer();
        const res = await apiClient(`/inventory/import?localId=${encodeURIComponent(localId)}`, {
          method: "POST",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: buffer,
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const details = (body as { details?: string[] }).details;
          throw new Error(
            details?.length
              ? details.join("\n")
              : (body as { error?: string }).error ?? "Error al importar el archivo",
          );
        }
        const result = (await res.json()) as { imported: number };
        await fetchAll();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [apiClient, fetchAll],
  );

  const fetchMovements = useCallback(
    async (inventoryItemId: string) => {
      setError(null);
      try {
        const res = await apiClient(`/inventory/${inventoryItemId}/movements`);
        if (!res.ok) throw new Error("Error al cargar movimientos");
        setMovements(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    },
    [apiClient],
  );

  const registerMovement = useCallback(
    async (
      inventoryItemId: string,
      data: { type: "in" | "out" | "adjustment"; quantity: number; reason?: string; createdByEmployeeId?: string },
    ): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient(`/inventory/${inventoryItemId}/movements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? "Error al registrar movimiento");
        }
        await fetchAll();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [apiClient, fetchAll],
  );

  return {
    items,
    movements,
    loading,
    saving,
    error,
    fetchAll,
    create,
    update,
    remove,
    bulkImport,
    fetchMovements,
    registerMovement,
  };
};
