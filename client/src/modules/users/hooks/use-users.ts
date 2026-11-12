import { useState, useCallback } from "react";
import { useApiClient } from "../../common/hooks/use-api-client";

export type UserRole = "owner" | "admin" | "employee";
export type PayCycle = "weekly" | "biweekly" | "monthly";

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  salaryAmount: number | null;
  payCycle: PayCycle | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  salaryAmount?: number;
  payCycle?: PayCycle;
}

export const useUsers = () => {
  const { apiClient } = useApiClient();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient("/auth/users");
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(data?.error || "Error al obtener usuarios");
      }
      const data = await response.json() as UserRecord[];
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  // Crea un empleado dentro del tenant actual -- a diferencia de
  // /auth/register (que crea un tenant nuevo cada vez), este endpoint
  // requiere sesion y nunca aisla al usuario creado en otra empresa.
  const createUser = useCallback(async (payload: CreateUserPayload): Promise<UserRecord | null> => {
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(false);
    try {
      const response = await apiClient("/auth/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(data?.error || "Error al crear usuario");
      }
      const data = await response.json() as { user: UserRecord };
      setCreateSuccess(true);
      return data.user;
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Error desconocido");
      return null;
    } finally {
      setCreating(false);
    }
  }, [apiClient]);

  const toggleUserStatus = useCallback(async (id: string): Promise<void> => {
    setTogglingId(id);
    try {
      const response = await apiClient(`/auth/users/${id}/toggle-status`, {
        method: "PATCH",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(data?.error || "Error al cambiar estado del usuario");
      }
      const updated = await response.json() as UserRecord;
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: updated.isActive } : u)));
    } finally {
      setTogglingId(null);
    }
  }, [apiClient]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    creating,
    createError,
    createSuccess,
    clearCreateError: () => setCreateError(null),
    clearCreateSuccess: () => setCreateSuccess(false),
    toggleUserStatus,
    togglingId,
  };
};
