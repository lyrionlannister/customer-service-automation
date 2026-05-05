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

  return { suppliers, loading, error, fetchAll };
};
