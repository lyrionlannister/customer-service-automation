import { useState, useCallback } from "react";
import { useApiClient } from "@common/hooks/use-api-client";

export interface PriceListSupplier {
  id: string;
  name: string;
  phone: string;
}

export interface PriceListItem {
  id: string;
  brand: string;
  model: string;
  price: number;
  supplierId: string;
  supplier: PriceListSupplier;
  createdAt: string;
  updatedAt: string;
}

const authHeader = (): Record<string, string> => {
  const token = sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const usePriceList = () => {
  const { apiClient } = useApiClient();
  const [items, setItems] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(
    async (query?: string) => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = query ? `/price-list?q=${encodeURIComponent(query)}` : "/price-list";
        const res = await apiClient(endpoint, { headers: authHeader() });
        if (!res.ok) throw new Error("Error al cargar lista de precios");
        setItems(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    },
    [apiClient],
  );

  const create = useCallback(
    async (
      data: Omit<PriceListItem, "id" | "createdAt" | "updatedAt" | "supplier">,
    ): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient("/price-list", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as any).error ?? "Error al crear item");
        }
        const created: PriceListItem = await res.json();
        setItems((prev) =>
          [...prev, created].sort((a, b) =>
            a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model),
          ),
        );
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
    async (
      id: string,
      data: Partial<Omit<PriceListItem, "id" | "createdAt" | "updatedAt" | "supplier">>,
    ): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient(`/price-list/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Error al actualizar item");
        const updated: PriceListItem = await res.json();
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
        const res = await apiClient(`/price-list/${id}`, {
          method: "DELETE",
          headers: authHeader(),
        });
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

  const uploadPdf = useCallback(
    async (
      file: File,
      supplierId: string,
    ): Promise<{ imported?: number; message?: string } | null> => {
      setUploading(true);
      setError(null);
      try {
        const buffer = await file.arrayBuffer();
        const res = await apiClient(
          `/price-list/upload?supplierId=${encodeURIComponent(supplierId)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/pdf", ...authHeader() },
            body: buffer,
          },
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as any).error ?? "Error al procesar el PDF");
        }
        return await res.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return null;
      } finally {
        setUploading(false);
      }
    },
    [apiClient],
  );

  return { items, loading, uploading, saving, error, fetchAll, create, update, remove, uploadPdf };
};
