import { useState, useCallback } from "react";
import { useApiClient } from "@common/hooks/use-api-client";

export interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  role: "owner" | "admin" | "employee";
}

export const useEmployees = () => {
  const { apiClient } = useApiClient();
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient("/auth/employees");
      if (!res.ok) throw new Error("Error al cargar empleados");
      setEmployees(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  return { employees, loading, error, fetchAll };
};
