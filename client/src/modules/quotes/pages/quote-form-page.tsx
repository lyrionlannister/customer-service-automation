import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useQuotes, type QuoteFormData, type QuoteItemInput } from "../hooks/use-quotes";
import { useInventory } from "@modules/inventory/hooks/use-inventory";
import { useLocal } from "@modules/local/hooks/use-local";
import EmployeeSelect from "@common/components/employee-select";
import Input from "@ui/inputs/input";
import Label from "@ui/inputs/label";
import Button from "@ui/button/button";
import Alert from "@ui/alert/alert";
import Select from "@ui/select/select";
import PageMeta from "@common/pages/page-meta";

type ItemLine = { inventoryItemId: string; description: string; quantity: string; unitPrice: string };
const emptyItemLine: ItemLine = { inventoryItemId: "", description: "", quantity: "1", unitPrice: "" };

const INITIAL_FORM: QuoteFormData = {
  localId: "",
  customerName: "",
  contactNumber: "",
  validUntil: "",
  createdByEmployeeId: "",
};

const QuoteFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const { quote, loading, saving, error, fetchQuote, fetchQuoteItems, createQuote, updateQuote, clearError } =
    useQuotes();
  const { items: inventoryItems, fetchAll: fetchInventory } = useInventory();
  const { local, fetchLocal } = useLocal();

  const [form, setForm] = useState<QuoteFormData>(INITIAL_FORM);
  const [itemLines, setItemLines] = useState<ItemLine[]>([{ ...emptyItemLine }]);

  useEffect(() => {
    fetchInventory();
    fetchLocal();
  }, [fetchInventory, fetchLocal]);

  useEffect(() => {
    if (isEdit && id) {
      fetchQuote(id);
      fetchQuoteItems(id).then((items) =>
        setItemLines(
          items.map((i) => ({
            inventoryItemId: i.inventoryItemId ?? "",
            description: i.description,
            quantity: String(i.quantity),
            unitPrice: String(i.unitPrice),
          })),
        ),
      );
    }
  }, [isEdit, id, fetchQuote, fetchQuoteItems]);

  useEffect(() => {
    if (quote && isEdit) {
      setForm({
        localId: quote.localId,
        customerName: quote.customerName,
        contactNumber: quote.contactNumber ?? "",
        validUntil: quote.validUntil ?? "",
        createdByEmployeeId: quote.createdByEmployeeId ?? "",
      });
    }
  }, [quote, isEdit]);

  useEffect(() => {
    if (!isEdit && local && !form.localId) {
      setForm((prev) => ({ ...prev, localId: local.id }));
    }
  }, [isEdit, local, form.localId]);

  const set = (field: keyof QuoteFormData, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const updateItemLine = (index: number, patch: Partial<ItemLine>) =>
    setItemLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));

  const handleInventoryItemChange = (index: number, inventoryItemId: string) => {
    const item = inventoryItems.find((i) => i.id === inventoryItemId);
    updateItemLine(index, {
      inventoryItemId,
      description: item ? item.name : "",
      unitPrice: item ? String(item.salePrice) : "",
    });
  };

  const addItemLine = () => setItemLines((prev) => [...prev, { ...emptyItemLine }]);
  const removeItemLine = (index: number) => setItemLines((prev) => prev.filter((_, i) => i !== index));

  const buildItemsPayload = (): QuoteItemInput[] =>
    itemLines
      .filter((l) => l.description.trim() && Number(l.quantity) > 0)
      .map((l) => ({
        inventoryItemId: l.inventoryItemId || undefined,
        description: l.description.trim(),
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice) || 0,
      }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const items = buildItemsPayload();
    if (isEdit && id) {
      const result = await updateQuote(id, form, items);
      if (result) navigate("/admin/quotes");
    } else {
      const result = await createQuote(form, items);
      if (result) navigate("/admin/quotes");
    }
  };

  if (loading && isEdit) {
    return <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Cargando cotización...</div>;
  }

  return (
    <div className="space-y-6">
      <PageMeta title={isEdit ? "Editar Cotización" : "Nueva Cotización"} description="Cotización para cliente" />
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/quotes")}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400">
            {isEdit ? "Editar cotización" : "Nueva cotización"}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {isEdit ? "Modifica los datos de la cotización." : "Genera una cotización para un cliente."}
          </p>
        </div>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3 space-y-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Datos del cliente</p>
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
            <div>
              <Label className="text-gray-500">Válida hasta</Label>
              <Input
                type="date"
                value={form.validUntil}
                onChange={(e) => set("validUntil", e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <Label className="text-gray-500">Generada por</Label>
              <EmployeeSelect
                value={form.createdByEmployeeId}
                onChange={(employeeId) => set("createdByEmployeeId", employeeId)}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3 space-y-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Items cotizados</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Selecciona un item de inventario para autocompletar, o escribe una descripción libre (mano de obra, servicio, etc.).
          </p>
          <div className="space-y-3">
            {itemLines.map((line, index) => (
              <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="w-full sm:w-56">
                  <Select
                    value={line.inventoryItemId}
                    onChange={(value) => handleInventoryItemChange(index, value)}
                    placeholder="Item de inventario (opcional)"
                    disabled={saving}
                    options={inventoryItems.map((i) => ({ value: i.id, label: i.name }))}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Descripción"
                    value={line.description}
                    onChange={(e) => updateItemLine(index, { description: e.target.value })}
                    disabled={saving}
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

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/quotes")} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear cotización"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuoteFormPage;
