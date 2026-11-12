import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useRepairNotes, type RepairNoteItemInput } from "../hooks/use-repair-notes";
import { useInventory } from "@modules/inventory/hooks/use-inventory";
import { useCash, type CashMovementMethod } from "@modules/cash/hooks/use-cash";
import useBranch from "@common/hooks/use-branch";
import Modal from "@ui/modal/modal";
import {
  INITIAL_FORM,
  STATUS_CONFIG,
  type RepairNoteFormData,
  type RepairNoteRecord,
  type RepairNoteStatus,
} from "../types/repair-note.types";
import Input from "@ui/inputs/input";
import Label from "@ui/inputs/label";
import Button from "@ui/button/button";
import Alert from "@ui/alert/alert";
import Toggle from "@ui/toggle/toggle";
import Select from "@ui/select/select";
import EmployeeSelect from "@common/components/employee-select";
import CustomerSelect from "@common/components/customer-select";
import ServiceTypeMultiSelect from "@common/components/service-type-multi-select";
import PageMeta from "@common/pages/page-meta";

type ItemLine = { inventoryItemId: string; quantity: string; unitPrice: string };
const emptyItemLine: ItemLine = { inventoryItemId: "", quantity: "1", unitPrice: "" };

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{children}</p>
);

const CheckboxField: React.FC<{
  checked: boolean;
  label: string;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}> = ({ checked, label, onChange, disabled }) => (
  <label className="flex cursor-pointer items-center gap-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className="size-4 rounded border-gray-300 accent-brand-600"
    />
    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
  </label>
);

const noteToForm = (n: RepairNoteRecord): RepairNoteFormData => ({
  customerName: n.customerName,
  contactNumber: n.contactNumber ?? "",
  brand: n.brand,
  model: n.model,
  reportedFailure: n.reportedFailure,
  totalValue: String(n.totalValue),
  status: n.status as RepairNoteStatus,
  requiresAdvance: n.requiresAdvance,
  advanceValue: n.advanceValue != null ? String(n.advanceValue) : "",
  receivedAt: n.receivedAt,
  deliveryDate: n.deliveryDate ?? "",
  technicianNotes: n.technicianNotes ?? "",
  additionalFindings: n.additionalFindings ?? "",
  assignedEmployeeId: n.assignedEmployeeId ?? "",
  localId: n.localId ?? "",
  customerId: n.customerId ?? "",
  serviceTypeIds: [],
  deviceOff: n.deviceOff,
  hasWarranty: n.hasWarranty,
  hasExtendedWarranty: n.hasExtendedWarranty,
  extendedWarrantyDays: n.extendedWarrantyDays != null ? String(n.extendedWarrantyDays) : "",
});

const RepairNoteFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const {
    note,
    loading,
    saving,
    error,
    fetchNote,
    fetchNoteItems,
    fetchNoteServiceTypeIds,
    createNote,
    updateNote,
    clearError,
  } = useRepairNotes();
  const { items: inventoryItems, fetchAll: fetchInventory } = useInventory();
  const { activeBranchId } = useBranch();
  const {
    session: cashSession,
    saving: cashSaving,
    error: cashError,
    fetchOpenSession,
    registerMovement,
    clearError: clearCashError,
  } = useCash();

  const [form, setForm] = useState<RepairNoteFormData>(INITIAL_FORM);
  const [itemLines, setItemLines] = useState<ItemLine[]>([]);
  const [initialServiceTypeIds, setInitialServiceTypeIds] = useState<string[]>([]);
  const [chargeNote, setChargeNote] = useState<RepairNoteRecord | null>(null);
  const [cashAmount, setCashAmount] = useState("0");
  const [cashMethod, setCashMethod] = useState<CashMovementMethod>("efectivo");
  const [cashEmployeeId, setCashEmployeeId] = useState("");

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    if (!isEdit && activeBranchId) {
      setForm((prev) => (prev.localId ? prev : { ...prev, localId: activeBranchId }));
    }
  }, [isEdit, activeBranchId]);

  useEffect(() => {
    if (isEdit && id) {
      fetchNote(id);
      fetchNoteItems(id).then((items) =>
        setItemLines(
          items.map((i) => ({
            inventoryItemId: i.inventoryItemId,
            quantity: String(i.quantity),
            unitPrice: String(i.unitPrice),
          })),
        ),
      );
      fetchNoteServiceTypeIds(id).then(setInitialServiceTypeIds);
    }
  }, [isEdit, id, fetchNote, fetchNoteItems, fetchNoteServiceTypeIds]);

  useEffect(() => {
    if (note && isEdit) {
      setForm({ ...noteToForm(note), serviceTypeIds: initialServiceTypeIds });
    }
  }, [note, isEdit, initialServiceTypeIds]);

  const set = (field: keyof RepairNoteFormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateItemLine = (index: number, patch: Partial<ItemLine>) =>
    setItemLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));

  const handleItemChange = (index: number, inventoryItemId: string) => {
    const item = inventoryItems.find((i) => i.id === inventoryItemId);
    updateItemLine(index, { inventoryItemId, unitPrice: item ? String(item.salePrice) : "" });
  };

  const addItemLine = () => setItemLines((prev) => [...prev, { ...emptyItemLine }]);
  const removeItemLine = (index: number) => setItemLines((prev) => prev.filter((_, i) => i !== index));

  const buildItemsPayload = (): RepairNoteItemInput[] =>
    itemLines
      .filter((l) => l.inventoryItemId && Number(l.quantity) > 0)
      .map((l) => ({
        inventoryItemId: l.inventoryItemId,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice) || 0,
      }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const items = buildItemsPayload();
    if (isEdit && id) {
      const result = await updateNote(id, form, items);
      if (!result) return;
      const turningDelivered = form.status === "delivered" && note?.status !== "delivered";
      if (turningDelivered) {
        await fetchOpenSession(activeBranchId);
        setCashAmount(String(result.totalValue));
        setCashEmployeeId(result.assignedEmployeeId ?? "");
        setChargeNote(result);
        return;
      }
      navigate("/admin/repair-notes");
    } else {
      const result = await createNote(form, items);
      if (result) navigate("/admin/repair-notes");
    }
  };

  const closeChargeModal = () => {
    setChargeNote(null);
    clearCashError();
    navigate("/admin/repair-notes");
  };

  const handleRegisterCharge = async () => {
    if (!chargeNote || !cashSession) return;
    const ok = await registerMovement(cashSession.id, {
      type: "income",
      method: cashMethod,
      amount: Number(cashAmount) || 0,
      createdByEmployeeId: cashEmployeeId,
      relatedEntityType: "repair_note",
      relatedEntityId: chargeNote.id,
    });
    if (ok) closeChargeModal();
  };

  if (loading && isEdit) {
    return (
      <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Cargando nota...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageMeta
        title={isEdit ? "Editar Reparación" : "Nueva Reparación"}
        description="Nota de reparación"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/repair-notes")}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400">
            {isEdit ? `Editar nota #${note?.controlNumber ?? ""}` : "Nueva nota de reparación"}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {isEdit ? "Modifica los datos de la nota." : "Registra un nuevo equipo en el taller."}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Error" message={error} />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3 space-y-4">
          <SectionTitle>Datos del cliente</SectionTitle>
          <div>
            <Label className="text-gray-500">Cliente existente</Label>
            <CustomerSelect
              value={form.customerId}
              onChange={(customerId, customer) =>
                setForm((prev) => ({
                  ...prev,
                  customerId,
                  customerName: customer ? customer.name : prev.customerName,
                  contactNumber: customer ? customer.phone : prev.contactNumber,
                }))
              }
              disabled={saving}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-gray-500">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                required
                placeholder="Nombre del cliente"
                value={form.customerName}
                onChange={(e) => set("customerName", e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <Label className="text-gray-500">Número de contacto</Label>
              <Input
                placeholder="Ej. 833 123 4567"
                value={form.contactNumber}
                onChange={(e) => set("contactNumber", e.target.value)}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Equipo */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3 space-y-4">
          <SectionTitle>Datos del equipo</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-gray-500">
                Marca <span className="text-red-500">*</span>
              </Label>
              <Input
                required
                placeholder="Ej. Samsung"
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <Label className="text-gray-500">
                Modelo <span className="text-red-500">*</span>
              </Label>
              <Input
                required
                placeholder="Ej. S7 Edge"
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-gray-500">
                Falla reportada <span className="text-red-500">*</span>
              </Label>
              <textarea
                required
                rows={3}
                placeholder="Describe la falla reportada por el cliente..."
                value={form.reportedFailure}
                onChange={(e) => set("reportedFailure", e.target.value)}
                disabled={saving}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Tipo de servicio */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3 space-y-4">
          <SectionTitle>Tipo de servicio</SectionTitle>
          <ServiceTypeMultiSelect
            value={form.serviceTypeIds}
            onChange={(serviceTypeIds) => setForm((prev) => ({ ...prev, serviceTypeIds }))}
            disabled={saving}
          />
          <CheckboxField
            label="Equipo apagado"
            checked={form.deviceOff}
            onChange={(v) => set("deviceOff", v)}
            disabled={saving}
          />
        </div>

        {/* Fechas y técnico */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3 space-y-4">
          <SectionTitle>Fechas y técnico</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label className="text-gray-500">
                Fecha de recibido <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                required
                value={form.receivedAt}
                onChange={(e) => set("receivedAt", e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <Label className="text-gray-500">Fecha de entrega estimada</Label>
              <Input
                type="date"
                value={form.deliveryDate}
                onChange={(e) => set("deliveryDate", e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <Label className="text-gray-500">Técnico a cargo</Label>
              <EmployeeSelect
                value={form.assignedEmployeeId}
                onChange={(employeeId) => set("assignedEmployeeId", employeeId)}
                placeholder="Selecciona un técnico"
                disabled={saving}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Label className="text-gray-500">Notas del técnico</Label>
              <textarea
                rows={2}
                placeholder="Observaciones internas del técnico..."
                value={form.technicianNotes}
                onChange={(e) => set("technicianNotes", e.target.value)}
                disabled={saving}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-gray-500"
              />
            </div>
            {isEdit && (
              <div className="sm:col-span-2 lg:col-span-3">
                <Label className="text-gray-500">Hallazgos adicionales</Label>
                <p className="mb-1.5 text-xs text-gray-400">
                  Fallas nuevas encontradas durante el servicio, distintas a la falla reportada por el cliente.
                </p>
                <textarea
                  rows={2}
                  placeholder="Ej. batería inflada, encontrada al abrir el equipo..."
                  value={form.additionalFindings}
                  onChange={(e) => set("additionalFindings", e.target.value)}
                  disabled={saving}
                  className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-gray-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Items usados */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3 space-y-4">
          <SectionTitle>Items usados</SectionTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Accesorios o partes del inventario consumidos en esta reparación — descuentan stock automáticamente.
          </p>
          <div className="space-y-3">
            {itemLines.map((line, index) => (
              <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Select
                    value={line.inventoryItemId}
                    onChange={(value) => handleItemChange(index, value)}
                    placeholder="Selecciona un item"
                    disabled={saving}
                    options={inventoryItems.map((i) => ({
                      value: i.id,
                      label: `${i.name} (stock: ${i.quantityOnHand})`,
                    }))}
                  />
                </div>
                <div className="w-full sm:w-24">
                  <Input
                    type="number"
                    placeholder="Cant."
                    value={line.quantity}
                    onChange={(e) => updateItemLine(index, { quantity: e.target.value })}
                    disabled={saving}
                  />
                </div>
                <div className="w-full sm:w-32">
                  <Input
                    type="number"
                    placeholder="Precio"
                    value={line.unitPrice}
                    onChange={(e) => updateItemLine(index, { unitPrice: e.target.value })}
                    disabled={saving}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItemLine(index)}
                  disabled={saving}
                  className="p-2.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addItemLine} disabled={saving}>
              <Plus className="mr-1.5 size-4" />
              Agregar item
            </Button>
          </div>
        </div>

        {/* Costo */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3 space-y-4">
          <SectionTitle>Costo</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="text-gray-500">Valor total ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.totalValue}
                onChange={(e) => set("totalValue", e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <Label className="text-gray-500">Requiere anticipo</Label>
              <div className="mt-1.5 flex h-[42px] items-center">
                <Toggle
                  checked={form.requiresAdvance}
                  onChange={() => set("requiresAdvance", !form.requiresAdvance)}
                  disabled={saving}
                />
              </div>
            </div>
            {form.requiresAdvance && (
              <div>
                <Label className="text-gray-500">Valor de anticipo ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.advanceValue}
                  onChange={(e) => set("advanceValue", e.target.value)}
                  disabled={saving}
                />
              </div>
            )}
          </div>
        </div>

        {/* Garantía */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3 space-y-4">
          <SectionTitle>Garantía</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="text-gray-500">Con garantía</Label>
              <div className="mt-1.5 flex h-[42px] items-center">
                <Toggle
                  checked={form.hasWarranty}
                  onChange={() => set("hasWarranty", !form.hasWarranty)}
                  disabled={saving}
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-500">Garantía extendida</Label>
              <div className="mt-1.5 flex h-[42px] items-center">
                <Toggle
                  checked={form.hasExtendedWarranty}
                  onChange={() => set("hasExtendedWarranty", !form.hasExtendedWarranty)}
                  disabled={saving}
                />
              </div>
            </div>
            {form.hasExtendedWarranty && (
              <div>
                <Label className="text-gray-500">Días de garantía extendida</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Ej. 30"
                  value={form.extendedWarrantyDays}
                  onChange={(e) => set("extendedWarrantyDays", e.target.value)}
                  disabled={saving}
                />
              </div>
            )}
          </div>
        </div>

        {/* Estado (solo en edición) */}
        {isEdit && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3 space-y-4">
            <SectionTitle>Estado de la nota</SectionTitle>
            <div className="max-w-xs">
              <select
                value={form.status}
                onChange={(e) => {
                  const newStatus = e.target.value as RepairNoteStatus;
                  setForm((prev) => ({
                    ...prev,
                    status: newStatus,
                    deliveryDate:
                      newStatus === "delivered" && !prev.deliveryDate
                        ? new Date().toISOString().split("T")[0]
                        : prev.deliveryDate,
                  }));
                }}
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 dark:border-gray-700 dark:text-white/90"
              >
                {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/repair-notes")}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear nota"}
          </Button>
        </div>
      </form>

      <Modal isOpen={Boolean(chargeNote)} onClose={closeChargeModal} className="max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Cobrar entrega</h3>
        {cashError && <Alert variant="error" title="Error" message={cashError} />}
        {chargeNote && !cashSession ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay una sesión de caja abierta para este local. La nota se guardó como entregada; puedes
              continuar sin registrar el cobro.
            </p>
            <div className="flex justify-end">
              <Button type="button" variant="primary" onClick={closeChargeModal}>
                Continuar
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monto a cobrar por esta nota (puede ser menor al total cotizado si no todo se cobró).
            </p>
            <div>
              <Label className="text-gray-500">Monto ($)</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                disabled={cashSaving}
              />
            </div>
            <div>
              <Label className="text-gray-500">Método</Label>
              <Select
                value={cashMethod}
                onChange={(value) => setCashMethod(value as CashMovementMethod)}
                disabled={cashSaving}
                options={[
                  { value: "efectivo", label: "Efectivo" },
                  { value: "tarjeta", label: "Tarjeta" },
                  { value: "transferencia", label: "Transferencia" },
                ]}
              />
            </div>
            <div>
              <Label className="text-gray-500">Empleado</Label>
              <EmployeeSelect value={cashEmployeeId} onChange={setCashEmployeeId} disabled={cashSaving} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={closeChargeModal} disabled={cashSaving}>
                Omitir cobro
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleRegisterCharge}
                disabled={cashSaving || !cashEmployeeId || Number(cashAmount) <= 0}
              >
                {cashSaving ? "Guardando..." : "Registrar cobro"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RepairNoteFormPage;
