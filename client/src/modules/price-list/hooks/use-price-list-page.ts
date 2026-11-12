import { useMemo, useState } from "react";

import type { PriceListItem } from "./use-price-list";

export type PriceListFormState = {
  brand: string;
  model: string;
  price: string;
  supplierId: string;
};

export const emptyPriceListForm: PriceListFormState = {
  brand: "",
  model: "",
  price: "",
  supplierId: "",
};

export const usePriceListPage = ({
  items,
  fetchAll,
  fetchSuppliers,
  create,
  update,
  remove,
  loading,
  saving,
  error,
  initialSuccessMessage,
}: {
  items: PriceListItem[];
  suppliers: Array<{ id: string; name: string }>;
  fetchAll: () => Promise<void>;
  fetchSuppliers: () => Promise<void>;
  create: (data: { brand: string; model: string; price: number; supplierId: string }) => Promise<boolean>;
  update: (
    id: string,
    data: Partial<{ brand: string; model: string; price: number; supplierId: string }>,
  ) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  loading: boolean;
  saving: boolean;
  error: string | null;
  initialSuccessMessage?: string | null;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceListItem | null>(null);
  const [form, setForm] = useState<PriceListFormState>(emptyPriceListForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(initialSuccessMessage ?? null);
  const [search, setSearch] = useState("");
  const [activeBrand, setActiveBrand] = useState<string>("Todos");
  const [activeSupplier, setActiveSupplier] = useState<string>("Todos");

  const brands = useMemo(() => {
    const set = new Set(items.map((item) => item.brand));
    return ["Todos", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesBrand = activeBrand === "Todos" || item.brand === activeBrand;
      const matchesSupplier = activeSupplier === "Todos" || item.supplier?.name === activeSupplier;
      const matchesSearch =
        !search ||
        item.model.toLowerCase().includes(search.toLowerCase()) ||
        item.brand.toLowerCase().includes(search.toLowerCase());

      return matchesBrand && matchesSupplier && matchesSearch;
    });
  }, [items, activeBrand, activeSupplier, search]);

  const notify = (message: string) => {
    setSuccessMsg(message);
    window.setTimeout(() => setSuccessMsg(null), 3500);
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyPriceListForm);
    setIsModalOpen(true);
  };

  const openEdit = (item: PriceListItem) => {
    setEditingItem(item);
    setForm({
      brand: item.brand,
      model: item.model,
      price: String(item.price),
      supplierId: item.supplierId,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setForm(emptyPriceListForm);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      brand: form.brand,
      model: form.model,
      price: Number.parseFloat(form.price),
      supplierId: form.supplierId,
    };

    let ok: boolean;
    if (editingItem) {
      ok = await update(editingItem.id, payload);
      if (ok) notify("Item actualizado correctamente.");
    } else {
      ok = await create(payload);
      if (ok) notify("Item creado correctamente.");
    }

    if (ok) closeModal();
  };

  const handleDelete = async (id: string) => {
    const ok = await remove(id);
    if (ok) notify("Item eliminado.");
    setDeleteConfirmId(null);
  };

  return {
    items,
    loading,
    saving,
    error,
    fetchAll,
    fetchSuppliers,
    isModalOpen,
    editingItem,
    form,
    setForm,
    deleteConfirmId,
    setDeleteConfirmId,
    successMsg,
    search,
    setSearch,
    activeBrand,
    setActiveBrand,
    activeSupplier,
    setActiveSupplier,
    brands,
    filtered,
    openCreate,
    openEdit,
    closeModal,
    handleChange,
    handleSubmit,
    handleDelete,
    notify,
  };
};
