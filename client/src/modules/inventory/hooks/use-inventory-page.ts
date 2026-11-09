import { useEffect, useRef, useState } from "react";

import type { InventoryItem, InventoryItemKind } from "./use-inventory";

export type InventoryFormState = {
  name: string;
  sku: string;
  kind: InventoryItemKind;
  costPrice: string;
  salePrice: string;
};

export type InventoryMovementForm = {
  type: "in" | "out" | "adjustment";
  quantity: string;
  reason: string;
  createdByEmployeeId: string;
};

export const emptyInventoryForm: InventoryFormState = {
  name: "",
  sku: "",
  kind: "accessory",
  costPrice: "",
  salePrice: "",
};

export const emptyMovementForm: InventoryMovementForm = {
  type: "in",
  quantity: "",
  reason: "",
  createdByEmployeeId: "",
};

export const useInventoryPage = ({
  items,
  branchId,
  fetchAll,
  create,
  update,
  remove,
  bulkImport,
  registerMovement,
  error,
  loading,
  saving,
}: {
  items: InventoryItem[];
  branchId: string;
  fetchAll: () => Promise<void>;
  create: (data: {
    localId: string;
    name: string;
    sku: string | null;
    kind: InventoryItemKind;
    costPrice: number;
    salePrice: number;
  }) => Promise<boolean>;
  update: (
    id: string,
    data: Partial<{
      localId: string;
      name: string;
      sku: string | null;
      kind: InventoryItemKind;
      costPrice: number;
      salePrice: number;
    }>,
  ) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  bulkImport: (file: File, localId: string) => Promise<{ imported: number } | null>;
  registerMovement: (
    inventoryItemId: string,
    data: {
      type: "in" | "out" | "adjustment";
      quantity: number;
      reason?: string;
      createdByEmployeeId?: string;
    },
  ) => Promise<boolean>;
  error: string | null;
  loading: boolean;
  saving: boolean;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<InventoryFormState>(emptyInventoryForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const [movementItem, setMovementItem] = useState<InventoryItem | null>(null);
  const [movementForm, setMovementForm] = useState<InventoryMovementForm>(emptyMovementForm);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const notify = (message: string) => {
    setSuccessMsg(message);
    window.setTimeout(() => setSuccessMsg(null), 3500);
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyInventoryForm);
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
    setForm(emptyInventoryForm);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!branchId) return;

    const payload = {
      localId: branchId,
      name: form.name,
      sku: form.sku || null,
      kind: form.kind,
      costPrice: Number.parseFloat(form.costPrice),
      salePrice: Number.parseFloat(form.salePrice),
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

  const handleImportSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!importFile || !branchId) return;

    const result = await bulkImport(importFile, branchId);
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

  const handleMovementSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!movementItem) return;

    const quantity = Number.parseInt(movementForm.quantity, 10);
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

  return {
    items,
    error,
    loading,
    saving,
    isModalOpen,
    editingItem,
    form,
    setForm,
    deleteConfirmId,
    setDeleteConfirmId,
    successMsg,
    isImportOpen,
    setIsImportOpen,
    importFile,
    setImportFile,
    importFileInputRef,
    movementItem,
    movementForm,
    setMovementForm,
    openCreate,
    openEdit,
    closeModal,
    handleChange,
    submit,
    handleDelete,
    closeImport,
    handleImportSubmit,
    openMovement,
    closeMovement,
    handleMovementSubmit,
  };
};
