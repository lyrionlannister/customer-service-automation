import { useState, useCallback } from "react";
import { useApiClient } from "@common/hooks/use-api-client";

export interface ServiceTypeOption {
  id: string;
  name: string;
}

const getAuthHeader = (): Record<string, string> => {
  const token = sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Tipos de servicio: configurables por tenant (regla transversal #1 — se
// seleccionan por id, nunca texto libre). Sembrados con defaults al crear
// el tenant; el tenant puede agregar los suyos via create().
export const useServiceTypes = () => {
  const { apiClient } = useApiClient();
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient("/service-types", { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Error al cargar tipos de servicio");
      setServiceTypes(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  const create = useCallback(
    async (name: string): Promise<ServiceTypeOption | null> => {
      try {
        const res = await apiClient("/service-types", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify({ name }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data?.error ? String(data.error) : "Error al crear el tipo de servicio");
        }
        const created = (await res.json()) as ServiceTypeOption;
        setServiceTypes((prev) => (prev.some((t) => t.id === created.id) ? prev : [...prev, created]));
        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return null;
      }
    },
    [apiClient],
  );

  return { serviceTypes, loading, error, fetchAll, create };
};
