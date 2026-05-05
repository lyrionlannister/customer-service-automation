import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useRepairNotes } from "../hooks/use-repair-notes";
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
import PageMeta from "@common/pages/page-meta";

const SERVICES = [
  { key: "serviceRepair", label: "Reparación" },
  { key: "serviceMaintenance", label: "Mantenimiento" },
  { key: "serviceDiagnostic", label: "Diagnóstico" },
  { key: "serviceRevision", label: "Revisión" },
  { key: "serviceWaterDamage", label: "Mojado" },
] as const;

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
  technicianName: n.technicianName ?? "",
  serviceRepair: n.serviceRepair,
  serviceMaintenance: n.serviceMaintenance,
  serviceDiagnostic: n.serviceDiagnostic,
  serviceRevision: n.serviceRevision,
  serviceWaterDamage: n.serviceWaterDamage,
  deviceOff: n.deviceOff,
  hasWarranty: n.hasWarranty,
  hasExtendedWarranty: n.hasExtendedWarranty,
  extendedWarrantyDays: n.extendedWarrantyDays != null ? String(n.extendedWarrantyDays) : "",
});

const RepairNoteFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const { note, loading, saving, error, fetchNote, createNote, updateNote, clearError } =
    useRepairNotes();

  const [form, setForm] = useState<RepairNoteFormData>(INITIAL_FORM);

  useEffect(() => {
    if (isEdit && id) {
      fetchNote(id);
    }
  }, [isEdit, id, fetchNote]);

  useEffect(() => {
    if (note && isEdit) {
      setForm(noteToForm(note));
    }
  }, [note, isEdit]);

  const set = (field: keyof RepairNoteFormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (isEdit && id) {
      const result = await updateNote(id, form);
      if (result) navigate("/admin/repair-notes");
    } else {
      const result = await createNote(form);
      if (result) navigate("/admin/repair-notes");
    }
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
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
          <SectionTitle>Datos del cliente</SectionTitle>
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
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
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
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
          <SectionTitle>Tipo de servicio</SectionTitle>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {SERVICES.map(({ key, label }) => (
              <CheckboxField
                key={key}
                label={label}
                checked={form[key]}
                onChange={(v) => set(key, v)}
                disabled={saving}
              />
            ))}
            <CheckboxField
              label="Equipo apagado"
              checked={form.deviceOff}
              onChange={(v) => set("deviceOff", v)}
              disabled={saving}
            />
          </div>
        </div>

        {/* Fechas y técnico */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
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
              <Input
                placeholder="Nombre del técnico"
                value={form.technicianName}
                onChange={(e) => set("technicianName", e.target.value)}
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
          </div>
        </div>

        {/* Costo */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
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
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
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
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
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
          <Button variant="primary" disabled={saving}>
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear nota"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RepairNoteFormPage;
