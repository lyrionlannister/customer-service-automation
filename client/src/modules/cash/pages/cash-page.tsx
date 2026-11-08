import { useEffect, useState } from "react";
import { Wallet, Plus, ArrowDownCircle, ArrowUpCircle, Lock } from "lucide-react";
import { useCash, type CashMovementMethod, type CashMovementType } from "../hooks/use-cash";
import { useLocal } from "@modules/local/hooks/use-local";
import EmployeeSelect from "@common/components/employee-select";
import Button from "@ui/button/button";
import Input from "@ui/inputs/input";
import Label from "@ui/inputs/label";
import Select from "@ui/select/select";
import Alert from "@ui/alert/alert";
import Modal from "@ui/modal/modal";
import PageMeta from "@common/pages/page-meta";

const METHOD_LABELS: Record<CashMovementMethod, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
};

const formatMoney = (v: number) => `$${Number(v).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

type MovementForm = {
  type: CashMovementType;
  method: CashMovementMethod;
  amount: string;
  note: string;
  createdByEmployeeId: string;
};
const emptyMovementForm: MovementForm = {
  type: "income",
  method: "efectivo",
  amount: "",
  note: "",
  createdByEmployeeId: "",
};

const CashPage: React.FC = () => {
  const { local, fetchLocal } = useLocal();
  const {
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
    clearError,
  } = useCash();

  const [openingBalance, setOpeningBalance] = useState("0");
  const [openedByEmployeeId, setOpenedByEmployeeId] = useState("");
  const [isMovementOpen, setIsMovementOpen] = useState(false);
  const [movementForm, setMovementForm] = useState<MovementForm>(emptyMovementForm);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [closingBalance, setClosingBalance] = useState("0");

  useEffect(() => {
    fetchLocal();
  }, [fetchLocal]);

  useEffect(() => {
    if (local) fetchOpenSession(local.id);
  }, [local, fetchOpenSession]);

  useEffect(() => {
    if (session) {
      fetchMovements(session.id);
      fetchSummary(session.id);
    }
  }, [session, fetchMovements, fetchSummary]);

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!local) return;
    await openSession(local.id, Number(openingBalance) || 0, openedByEmployeeId || undefined);
  };

  const handleRegisterMovement = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setMovementForm(emptyMovementForm);
    }
  };

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const ok = await closeSession(session.id, Number(closingBalance) || 0);
    if (ok) {
      setIsCloseOpen(false);
      if (local) fetchOpenSession(local.id);
    }
  };

  if (loading && !session) {
    return <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Cargando caja...</div>;
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Caja" description="Control de caja del local" />
      <div>
        <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400">Caja</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Apertura, movimientos y cierre de caja del local.
        </p>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}

      {!session ? (
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3 space-y-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Abrir caja</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">No hay una sesión de caja abierta para este local.</p>
          <form onSubmit={handleOpen} className="space-y-4">
            <div>
              <Label className="text-gray-500">Saldo de apertura</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <Label className="text-gray-500">Empleado que abre</Label>
              <EmployeeSelect value={openedByEmployeeId} onChange={setOpenedByEmployeeId} disabled={saving} />
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={saving}>
              {saving ? "Abriendo..." : "Abrir caja"}
            </Button>
          </form>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
              <p className="text-xs font-semibold uppercase text-gray-400">Saldo de apertura</p>
              <p className="mt-1 text-xl font-bold text-gray-800 dark:text-white/90">
                {formatMoney(session.openingBalance)}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
              <p className="text-xs font-semibold uppercase text-gray-400">Ingresos</p>
              <p className="mt-1 text-xl font-bold text-green-600 dark:text-green-400">
                {formatMoney(summary?.totalIncome ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
              <p className="text-xs font-semibold uppercase text-gray-400">Egresos</p>
              <p className="mt-1 text-xl font-bold text-red-500 dark:text-red-400">
                {formatMoney(summary?.totalExpense ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
              <p className="text-xs font-semibold uppercase text-gray-400">Esperado en caja</p>
              <p className="mt-1 text-xl font-bold text-brand-600 dark:text-brand-400">
                {formatMoney(
                  Number(session.openingBalance) + (summary?.byMethod.efectivo.income ?? 0) - (summary?.byMethod.efectivo.expense ?? 0),
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="primary" onClick={() => setIsMovementOpen(true)}>
              <Plus className="mr-1.5 size-4" />
              Registrar movimiento
            </Button>
            <Button variant="outline" onClick={() => setIsCloseOpen(true)}>
              <Lock className="mr-1.5 size-4" />
              Cerrar caja
            </Button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 overflow-hidden">
            {movements.length === 0 ? (
              <div className="p-12 flex flex-col items-center gap-3 text-center text-gray-400">
                <Wallet className="size-10 opacity-40" />
                <p className="text-sm">Sin movimientos registrados todavía.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Hora</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Tipo</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Método</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Nota</th>
                    <th className="px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">{formatTime(m.createdAt)}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium">
                          {m.type === "income" ? (
                            <ArrowUpCircle className="size-3.5 text-green-500" />
                          ) : (
                            <ArrowDownCircle className="size-3.5 text-red-500" />
                          )}
                          {m.type === "income" ? "Ingreso" : "Egreso"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">{METHOD_LABELS[m.method]}</td>
                      <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">{m.note ?? "—"}</td>
                      <td
                        className={`px-5 py-3 text-right font-medium tabular-nums ${
                          m.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                        }`}
                      >
                        {m.type === "income" ? "+" : "-"}
                        {formatMoney(m.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Modal registrar movimiento */}
      <Modal
        isOpen={isMovementOpen}
        onClose={() => {
          setIsMovementOpen(false);
          clearError();
        }}
        className="max-w-md p-6 sm:p-8 mx-4"
      >
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5">Registrar movimiento</h2>
        <form onSubmit={handleRegisterMovement} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-500">Tipo</Label>
              <Select
                value={movementForm.type}
                onChange={(value) => setMovementForm((prev) => ({ ...prev, type: value as CashMovementType }))}
                disabled={saving}
                options={[
                  { value: "income", label: "Ingreso" },
                  { value: "expense", label: "Egreso" },
                ]}
              />
            </div>
            <div>
              <Label className="text-gray-500">Método</Label>
              <Select
                value={movementForm.method}
                onChange={(value) => setMovementForm((prev) => ({ ...prev, method: value as CashMovementMethod }))}
                disabled={saving}
                options={Object.entries(METHOD_LABELS).map(([value, label]) => ({ value, label }))}
              />
            </div>
          </div>
          <div>
            <Label className="text-gray-500">Monto</Label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={movementForm.amount}
              onChange={(e) => setMovementForm((prev) => ({ ...prev, amount: e.target.value }))}
              required
              disabled={saving}
            />
            {movementForm.method === "efectivo" && Number(local?.cashRoundingUnit) > 0 && (
              <p className="mt-1 text-xs text-gray-400">
                Se redondeará al múltiplo de {local?.cashRoundingUnit} más cercano.
              </p>
            )}
          </div>
          <div>
            <Label className="text-gray-500">Nota</Label>
            <Input
              placeholder="Opcional"
              value={movementForm.note}
              onChange={(e) => setMovementForm((prev) => ({ ...prev, note: e.target.value }))}
              disabled={saving}
            />
          </div>
          <div>
            <Label className="text-gray-500">Empleado</Label>
            <EmployeeSelect
              value={movementForm.createdByEmployeeId}
              onChange={(employeeId) => setMovementForm((prev) => ({ ...prev, createdByEmployeeId: employeeId }))}
              disabled={saving}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setIsMovementOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={saving || !movementForm.createdByEmployeeId}>
              {saving ? "Guardando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal cerrar caja */}
      <Modal isOpen={isCloseOpen} onClose={() => setIsCloseOpen(false)} className="max-w-md p-6 sm:p-8 mx-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5">Cerrar caja</h2>
        <form onSubmit={handleClose} className="space-y-4">
          <div>
            <Label className="text-gray-500">Saldo de cierre (conteo físico)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={closingBalance}
              onChange={(e) => setClosingBalance(e.target.value)}
              required
              disabled={saving}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setIsCloseOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Cerrando..." : "Cerrar caja"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CashPage;
