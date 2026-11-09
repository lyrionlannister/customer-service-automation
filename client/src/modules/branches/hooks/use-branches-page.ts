import { useEffect, useState } from "react";

import type { Branch } from "./use-branches";

export interface BranchFormState {
  name: string;
  address: string;
  phone: string;
}

export const emptyBranchForm: BranchFormState = {
  name: "",
  address: "",
  phone: "",
};

export const useBranchesPage = ({
  fetchAll,
  create,
  update,
  setActive,
  refreshBranches,
}: {
  fetchAll: () => Promise<void>;
  create: (data: Pick<Branch, "name" | "address" | "phone">) => Promise<boolean>;
  update: (id: string, data: Pick<Branch, "name" | "address" | "phone">) => Promise<boolean>;
  setActive: (id: string, isActive: boolean) => Promise<boolean>;
  refreshBranches: () => Promise<void>;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchFormState>(emptyBranchForm);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const openCreate = () => {
    setEditingBranch(null);
    setForm(emptyBranchForm);
    setIsModalOpen(true);
  };

  const openEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setForm({ name: branch.name, address: branch.address ?? "", phone: branch.phone ?? "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
    setForm(emptyBranchForm);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const ok = editingBranch ? await update(editingBranch.id, form) : await create(form);
    if (ok) {
      setSuccessMsg(editingBranch ? "Sucursal actualizada correctamente." : "Sucursal creada correctamente.");
      closeModal();
      await refreshBranches();
      window.setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleToggleActive = async (branch: Branch) => {
    const ok = await setActive(branch.id, !branch.isActive);
    if (ok) await refreshBranches();
  };

  return {
    isModalOpen,
    editingBranch,
    form,
    successMsg,
    openCreate,
    openEdit,
    closeModal,
    handleChange,
    handleSubmit,
    handleToggleActive,
  };
};
