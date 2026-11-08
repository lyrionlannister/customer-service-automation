import { useEffect, useRef, useState } from "react";
import { Boxes, Plus, Pencil, Trash2, X, Check, ArrowUpDown, Upload, FileSpreadsheet } from "lucide-react";
import { useInventory, type InventoryItem, type InventoryItemKind } from "../hooks/use-inventory";
import { useLocal } from "@modules/local/hooks/use-local";
import EmployeeSelect from "@common/components/employee-select";
import Button from "@ui/button/button";
import Input from "@ui/inputs/input";
import Label from "@ui/inputs/label";
import Select from "@ui/select/select";
import Alert from "@ui/alert/alert";
import Modal from "@ui/modal/modal";
import PageMeta from "@common/pages/page-meta";

const KIND_LABELS: Record<InventoryItemKind, string> = {
  accessory: "Accesorio",
  part: "Parte",
};

type FormState = {
  name: string;
  sku: string;
  kind: InventoryItemKind;
  costPrice: string;
  salePrice: string;
};

const emptyForm: FormState = { name: "", sku: "", kind: "accessory", costPrice: "", salePrice: "" };

type MovementForm = {
  type: "in" | "out" | "adjustment";
  quantity: string;
  reason: string;
  createdByEmployeeId: string;
};

const emptyMovementForm: MovementForm = { type: "in", quantity: "", reason: "", createdByEmployeeId: "" };

const formatMoney = (v: number) => `$${Number(v).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

const InventoryPage: React.FC = () => {
  const { items, loading, saving, error, fetchAll, create, update, remove, bulkImport, registerMovement } =
    useInventory();
  const { local, fetchLocal } = useLocal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const [movementItem, setMovementItem] = useState<InventoryItem | null>(null);
  const [movementForm, setMovementForm] = useState<MovementForm>(emptyMovementForm);

  useEffect(() => {
    fetchAll();
    fetchLocal();
  }, [fetchAll, fetchLocal]);

  const notify = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      sku: item.sku ?? "",
      kind: item.kind,
      costPrice: String(item.costPrice),
      salePrice: String(item.salePrice),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!local) return;
    const payload = {
      localId: local.id,
      name: form.name,
      sku: form.sku || null,
      kind: form.kind,
      costPrice: parseFloat(form.costPrice),
      salePrice: parseFloat(form.salePrice),
    };
    const ok = editingItem ? await update(editingItem.id, payload) : await create(payload);
    if (ok) {
      notify(editingItem ? "Item actualizado correctamente." : "Item creado correctamente.");
      closeModal();
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await remove(id);
    if (ok) notify("Item eliminado.");
    setDeleteConfirmId(null);
  };

  const closeImport = () => {
    setIsImportOpen(false);
    setImportFile(null);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile || !local) return;
    const result = await bulkImport(importFile, local.id);
    if (result) {
      notify(`Importación completada: ${result.imported} items cargados.`);
      closeImport();
    }
  };

  const openMovement = (item: InventoryItem) => {
    setMovementItem(item);
    setMovementForm(emptyMovementForm);
  };

  const closeMovement = () => {
    setMovementItem(null);
    setMovementForm(emptyMovementForm);
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementItem) return;
    const quantity = parseInt(movementForm.quantity, 10);
    const signedQuantity = movementForm.type === "adjustment" ? quantity : Math.abs(quantity);
    const ok = await registerMovement(movementItem.id, {
      type: movementForm.type,
      quantity: signedQuantity,
      reason: movementForm.reason || undefined,
      createdByEmployeeId: movementForm.createdByEmployeeId || undefined,
    });
    if (ok) {
      notify("Movimiento registrado.");
      closeMovement();
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Inventario" description="Inventario de accesorios y partes" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400">Inventario</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {items.length > 0 ? `${items.length} items en total.` : "Sin items cargados."}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="mr-1.5 size-4" />
            Importar CSV/Excel
          </Button>
          <Button variant="primary" onClick={openCreate}>
            <Plus className="mr-1.5 size-4" />
            Nuevo item
          </Button>
        </div>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}
      {successMsg && <Alert variant="success" title="Listo" message={successMsg} />}

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Cargando inventario...</div>
        ) : items.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3 text-center text-gray-400">
            <Boxes className="size-10 opacity-40" />
            <p className="text-sm">No hay items. Agrega el primero.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Nombre</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">SKU</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Tipo</th>
                  <th className="px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Costo</th>
                  <th className="px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Venta</th>
                  <th className="px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Stock</th>
                  <th className="px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400 w-36">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/2">
                    <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">{item.name}</td>
                    <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">{item.sku ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">{KIND_LABELS[item.kind]}</td>
                    <td className="px-5 py-3 text-right text-gray-700 dark:text-gray-300 tabular-nums">
                      {formatMoney(item.costPrice)}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-700 dark:text-gray-300 tabular-nums">
                      {formatMoney(item.salePrice)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      <span
                        className={
                          item.quantityOnHand <= 0
                            ? "text-error-500 font-medium"
                            : "text-gray-700 dark:text-gray-300"
                        }
                      >
                        {item.quantityOnHand}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {deleteConfirmId === item.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Check className="size-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openMovement(item)}
                            title="Registrar movimiento"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30"
                          >
                            <ArrowUpDown className="size-4" />
                          </button>
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear/editar item */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-md p-6 sm:p-8 mx-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5">
          {editingItem ? "Editar item" : "Nuevo item"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-500">Nombre</Label>
            <Input name="name" placeholder="Pantalla A52" value={form.name} onChange={handleChange} required disabled={saving} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-500">SKU</Label>
              <Input name="sku" placeholder="Opcional" value={form.sku} onChange={handleChange} disabled={saving} />
            </div>
            <div>
              <Label className="text-gray-500">Tipo</Label>
              <Select
                value={form.kind}
                onChange={(value) => setForm((prev) => ({ ...prev, kind: value as InventoryItemKind }))}
                disabled={saving}
                options={Object.entries(KIND_LABELS).map(([value, label]) => ({ value, label }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-500">Precio de costo</Label>
              <Input
                name="costPrice"
                type="number"
                placeholder="0.00"
                value={form.costPrice}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </div>
            <div>
              <Label className="text-gray-500">Precio de venta</Label>
              <Input
                name="salePrice"
                type="number"
                placeholder="0.00"
                value={form.salePrice}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Guardando..." : editingItem ? "Guardar cambios" : "Crear item"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal registrar movimiento */}
      <Modal isOpen={movementItem !== null} onClose={closeMovement} className="max-w-md p-6 sm:p-8 mx-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">Registrar movimiento</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{movementItem?.name}</p>
        <form onSubmit={handleMovementSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-500">Tipo</Label>
              <Select
                value={movementForm.type}
                onChange={(value) => setMovementForm((prev) => ({ ...prev, type: value as MovementForm["type"] }))}
                disabled={saving}
                options={[
                  { value: "in", label: "Entrada" },
                  { value: "out", label: "Salida" },
                  { value: "adjustment", label: "Ajuste (+/-)" },
                ]}
              />
            </div>
            <div>
              <Label className="text-gray-500">Cantidad</Label>
              <Input
                type="number"
                placeholder="Ej. 5"
                value={movementForm.quantity}
                onChange={(e) => setMovementForm((prev) => ({ ...prev, quantity: e.target.value }))}
                required
                disabled={saving}
              />
            </div>
          </div>
          <div>
            <Label className="text-gray-500">Motivo</Label>
            <Input
              placeholder="Opcional"
              value={movementForm.reason}
              onChange={(e) => setMovementForm((prev) => ({ ...prev, reason: e.target.value }))}
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
            <Button type="button" variant="outline" onClick={closeMovement} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Guardando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </Modal>
      {/* Modal importar CSV/Excel */}
      <Modal isOpen={isImportOpen} onClose={closeImport} className="max-w-md p-6 sm:p-8 mx-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">Importar inventario</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Columnas esperadas: nombre, sku (opcional), tipo (accesorio/refacción), precio costo, precio venta, cantidad (opcional).
        </p>
        <form onSubmit={handleImportSubmit} className="space-y-4">
          <div
            onClick={() => importFileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-8 cursor-pointer hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-brand-700 dark:hover:bg-white/2"
          >
            <input
              ref={importFileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setImportFile(f);
                e.target.value = "";
              }}
            />
            <FileSpreadsheet className="size-8 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              {importFile ? importFile.name : "Haz clic para seleccionar un CSV o Excel"}
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={closeImport} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={saving || !importFile}>
              {saving ? "Importando..." : "Importar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
