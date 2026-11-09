import { useEffect, useState } from "react";

import type { MessageTemplate } from "./use-message-templates";

export interface MessageTemplateFormState {
  key: string;
  text: string;
  description: string;
}

export const emptyMessageTemplateForm: MessageTemplateFormState = {
  key: "",
  text: "",
  description: "",
};

export const useMessageTemplatesPage = ({
  templates,
  loading,
  saving,
  error,
  fetchAll,
  create,
  update,
  remove,
}: {
  templates: MessageTemplate[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (data: Pick<MessageTemplate, "key" | "text" | "description">) => Promise<boolean>;
  update: (id: string, data: Pick<MessageTemplate, "text" | "description">) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [form, setForm] = useState<MessageTemplateFormState>(emptyMessageTemplateForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const openCreate = () => {
    setEditingTemplate(null);
    setForm(emptyMessageTemplateForm);
    setIsModalOpen(true);
  };

  const openEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setForm({ key: template.key, text: template.text, description: template.description ?? "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    setForm(emptyMessageTemplateForm);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let ok: boolean;
    if (editingTemplate) {
      ok = await update(editingTemplate.id, { text: form.text, description: form.description });
      if (ok) setSuccessMsg("Template actualizado correctamente.");
    } else {
      ok = await create({ key: form.key, text: form.text, description: form.description });
      if (ok) setSuccessMsg("Template creado correctamente.");
    }

    if (ok) {
      closeModal();
      window.setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await remove(id);
    if (ok) {
      setSuccessMsg("Template eliminado.");
      window.setTimeout(() => setSuccessMsg(null), 3000);
    }
    setDeleteConfirmId(null);
  };

  return {
    templates,
    loading,
    saving,
    error,
    isModalOpen,
    editingTemplate,
    form,
    setForm,
    deleteConfirmId,
    setDeleteConfirmId,
    successMsg,
    openCreate,
    openEdit,
    closeModal,
    handleChange,
    handleSubmit,
    handleDelete,
  };
};
