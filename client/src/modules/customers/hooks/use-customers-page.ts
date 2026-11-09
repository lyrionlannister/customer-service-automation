import { useEffect, useMemo, useState } from "react";

import type { Customer } from "./use-customers";

export interface CustomerFormState {
  name: string;
  phone: string;
  email: string;
}

export const emptyCustomerForm: CustomerFormState = {
  name: "",
  phone: "",
  email: "",
};

export const useCustomersPage = ({
  customers,
  fetchAll,
  fetchDevices,
  create,
  update,
  remove,
}: {
  customers: Customer[];
  fetchAll: () => Promise<void>;
  fetchDevices: (customerId: string) => Promise<void>;
  create: (data: Pick<Customer, "name" | "phone" | "email">) => Promise<Customer | null>;
  update: (id: string, data: Pick<Customer, "name" | "phone" | "email">) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerFormState>(emptyCustomerForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        (c.email ?? "").toLowerCase().includes(term),
    );
  }, [search, customers]);

  const openCreate = () => {
    setEditingCustomer(null);
    setForm(emptyCustomerForm);
    setIsModalOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({ name: customer.name, phone: customer.phone, email: customer.email ?? "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setForm(emptyCustomerForm);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = { name: form.name, phone: form.phone, email: form.email || null };

    let ok: boolean;
    if (editingCustomer) {
      ok = await update(editingCustomer.id, payload);
      if (ok) setSuccessMsg("Cliente actualizado correctamente.");
    } else {
      ok = Boolean(await create(payload));
      if (ok) setSuccessMsg("Cliente creado correctamente.");
    }

    if (ok) {
      closeModal();
      window.setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await remove(id);
    if (ok) {
      setSuccessMsg("Cliente eliminado.");
      window.setTimeout(() => setSuccessMsg(null), 3000);
    }
    setDeleteConfirmId(null);
  };

  const openHistory = (customer: Customer) => {
    setHistoryCustomer(customer);
    fetchDevices(customer.id);
  };

  const closeHistory = () => setHistoryCustomer(null);

  return {
    isModalOpen,
    editingCustomer,
    form,
    deleteConfirmId,
    setDeleteConfirmId,
    successMsg,
    search,
    setSearch,
    filteredCustomers,
    historyCustomer,
    openCreate,
    openEdit,
    closeModal,
    handleChange,
    handleSubmit,
    handleDelete,
    openHistory,
    closeHistory,
  };
};
