import { useState, useCallback } from "react";
import { useApiClient } from "@common/hooks/use-api-client";

export type CashSessionStatus = "open" | "closed";
export type CashMovementType = "income" | "expense";
export type CashMovementMethod = "efectivo" | "tarjeta" | "transferencia";

export interface CashSessionRecord {
  id: string;
  localId: string;
  openedByEmployeeId: string | null;
  openingBalance: number;
  closingBalance: number | null;
  status: CashSessionStatus;
  openedAt: string;
  closedAt: string | null;
}

export interface CashMovementRecord {
  id: string;
  cashSessionId: string;
  type: CashMovementType;
  method: CashMovementMethod;
  amount: number;
  note: string | null;
  createdByEmployeeId: string | null;
  createdAt: string;
}

export interface CashSummary {
  totalIncome: number;
  totalExpense: number;
  net: number;
  byMethod: Record<CashMovementMethod, { income: number; expense: number }>;
}

export const useCash = () => {
  const { apiClient } = useApiClient();
  const [session, setSession] = useState<CashSessionRecord | null>(null);
  const [movements, setMovements] = useState<CashMovementRecord[]>([]);
  const [summary, setSummary] = useState<CashSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOpenSession = useCallback(
    async (localId: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient(`/cash/sessions/open?localId=${encodeURIComponent(localId)}`);
        if (!res.ok) throw new Error("Error al consultar la sesión de caja");
        const data = (await res.json()) as CashSessionRecord | null;
        setSession(data);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiClient],
  );

  const openSession = useCallback(
    async (localId: string, openingBalance: number, openedByEmployeeId?: string): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient("/cash/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ localId, openingBalance, openedByEmployeeId }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string | string[] }).error?.toString() ?? "Error al abrir caja");
        }
        setSession((await res.json()) as CashSessionRecord);
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

  const closeSession = useCallback(
    async (id: string, closingBalance: number): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient(`/cash/sessions/${id}/close`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ closingBalance }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string | string[] }).error?.toString() ?? "Error al cerrar caja");
        }
        setSession(null);
        setMovements([]);
        setSummary(null);
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

  const fetchMovements = useCallback(
    async (sessionId: string) => {
      try {
        const res = await apiClient(`/cash/sessions/${sessionId}/movements`);
        if (!res.ok) return;
        setMovements((await res.json()) as CashMovementRecord[]);
      } catch {
        // noop: la pantalla ya tiene un estado anterior razonable
      }
    },
    [apiClient],
  );

  const fetchSummary = useCallback(
    async (sessionId: string) => {
      try {
        const res = await apiClient(`/cash/sessions/${sessionId}/summary`);
        if (!res.ok) return;
        setSummary((await res.json()) as CashSummary);
      } catch {
        // noop
      }
    },
    [apiClient],
  );

  const registerMovement = useCallback(
    async (
      sessionId: string,
      data: { type: CashMovementType; method: CashMovementMethod; amount: number; note?: string; createdByEmployeeId: string },
    ): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await apiClient(`/cash/sessions/${sessionId}/movements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            (body as { error?: string | string[] }).error?.toString() ?? "Error al registrar movimiento",
          );
        }
        await Promise.all([fetchMovements(sessionId), fetchSummary(sessionId)]);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [apiClient, fetchMovements, fetchSummary],
  );

  return {
    session,
    movements,
    summary,
    loading,
    saving,
    error,
    fetchOpenSession,
    openSession,
    closeSession,
    fetchMovements,
    fetchSummary,
    registerMovement,
    clearError: () => setError(null),
  };
};
