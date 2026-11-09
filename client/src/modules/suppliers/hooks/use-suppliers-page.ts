import { useEffect, useMemo, useState } from "react";

import type { Supplier } from "./use-suppliers";

export interface SupplierFormState {
  name: string;
  phone: string;
}

export const emptySupplierForm: SupplierFormState = {
  name: "",
  phone: "",
};

export const useSuppliersPage = ({
  suppliers,
  loading,
  saving,
  error,
  fetchAll,
  create,
  update,
  remove,
}: {
  suppliers: Supplier[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (data: Pick<Supplier, "name" | "phone">) => Promise<boolean>;
  update: (id: string, data: Pick<Supplier, "name" | "phone">) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierFormState>(emptySupplierForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredSuppliers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return suppliers;
    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(term) || supplier.phone.toLowerCase().includes(term),
    );
  }, [search, suppliers]);

  const openCreate = () => {
    setEditingSupplier(null);
    setForm(emptySupplierForm);
    setIsModalOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setForm({ name: supplier.name, phone: supplier.phone ?? "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
    setForm(emptySupplierForm);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let ok: boolean;
    if (editingSupplier) {
      ok = await update(editingSupplier.id, { name: form.name, phone: form.phone });
      if (ok) setSuccessMsg("Proveedor actualizado correctamente.");
    } else {
      ok = await create({ name: form.name, phone: form.phone });
      if (ok) setSuccessMsg("Proveedor creado correctamente.");
    }

    if (ok) {
      closeModal();
      window.setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await remove(id);
    if (ok) {
      setSuccessMsg("Proveedor eliminado.");
      window.setTimeout(() => setSuccessMsg(null), 3000);
    }
    setDeleteConfirmId(null);
  };

  return {
    isModalOpen,
    editingSupplier,
    form,
    deleteConfirmId,
    setDeleteConfirmId,
    successMsg,
    search,
    setSearch,
    filteredSuppliers,
    openCreate,
    openEdit,
    closeModal,
    handleChange,
    handleSubmit,
    handleDelete,
    loading,
    saving,
    error,
  };
};
