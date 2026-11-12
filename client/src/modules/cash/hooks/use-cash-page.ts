import { useEffect, useState } from "react";

import type { CashMovementMethod, CashMovementType, CashSessionRecord, CashSummary } from "./use-cash";

export type CashMovementForm = {
  type: CashMovementType;
  method: CashMovementMethod;
  amount: string;
  note: string;
  createdByEmployeeId: string;
};

export const emptyCashMovementForm: CashMovementForm = {
  type: "income",
  method: "efectivo",
  amount: "",
  note: "",
  createdByEmployeeId: "",
};

export const useCashPage = ({
  local,
  branchId,
  session,
  movements,
  summary,
  loading,
  saving,
  error,
  fetchLocal,
  fetchOpenSession,
  openSession,
  closeSession,
  fetchMovements,
  fetchSummary,
  registerMovement,
  clearError,
}: {
  local: { id: string } | null;
  branchId: string;
  session: CashSessionRecord | null;
  movements: Array<{ id: string; type: CashMovementType; method: CashMovementMethod; amount: number; note: string | null; createdAt: string }>
  summary: CashSummary | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchLocal: () => Promise<void>;
  fetchOpenSession: (localId: string) => Promise<CashSessionRecord | null>;
  openSession: (localId: string, openingBalance: number, openedByEmployeeId?: string) => Promise<boolean>;
  closeSession: (id: string, closingBalance: number) => Promise<boolean>;
  fetchMovements: (sessionId: string) => Promise<void>;
  fetchSummary: (sessionId: string) => Promise<void>;
  registerMovement: (
    sessionId: string,
    data: {
      type: CashMovementType;
      method: CashMovementMethod;
      amount: number;
      note?: string;
      createdByEmployeeId: string;
    },
  ) => Promise<boolean>;
  clearError: () => void;
}) => {
  const [openingBalance, setOpeningBalance] = useState("0");
  const [openedByEmployeeId, setOpenedByEmployeeId] = useState("");
  const [isMovementOpen, setIsMovementOpen] = useState(false);
  const [movementForm, setMovementForm] = useState<CashMovementForm>(emptyCashMovementForm);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [closingBalance, setClosingBalance] = useState("0");

  useEffect(() => {
    fetchLocal();
  }, [fetchLocal]);

  useEffect(() => {
    if (branchId) fetchOpenSession(branchId);
  }, [branchId, fetchOpenSession]);

  useEffect(() => {
    if (session) {
      fetchMovements(session.id);
      fetchSummary(session.id);
    }
  }, [session, fetchMovements, fetchSummary]);

  const handleOpen = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!branchId) return;
    await openSession(branchId, Number(openingBalance) || 0, openedByEmployeeId || undefined);
  };

  const handleRegisterMovement = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session) return;

    const ok = await registerMovement(session.id, {
      type: movementForm.type,
      method: movementForm.method,
      amount: Number(movementForm.amount) || 0,
      note: movementForm.note || undefined,
      createdByEmployeeId: movementForm.createdByEmployeeId,
    });

    if (ok) {
      setIsMovementOpen(false);
      setMovementForm(emptyCashMovementForm);
    }
  };

  const handleClose = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session) return;

    const ok = await closeSession(session.id, Number(closingBalance) || 0);
    if (ok) {
      setIsCloseOpen(false);
      if (branchId) fetchOpenSession(branchId);
    }
  };

  return {
    openingBalance,
    setOpeningBalance,
    openedByEmployeeId,
    setOpenedByEmployeeId,
    isMovementOpen,
    setIsMovementOpen,
    movementForm,
    setMovementForm,
    isCloseOpen,
    setIsCloseOpen,
    closingBalance,
    setClosingBalance,
    loading,
    saving,
    error,
    clearError,
    session,
    movements,
    summary,
    local,
    handleOpen,
    handleRegisterMovement,
    handleClose,
  };
};
