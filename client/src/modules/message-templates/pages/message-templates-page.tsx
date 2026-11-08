import { useEffect, useState } from "react";
import { MessageSquareText, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useMessageTemplates, type MessageTemplate } from "../hooks/use-message-templates";
import Button from "@ui/button/button";
import Input from "@ui/inputs/input";
import Label from "@ui/inputs/label";
import Alert from "@ui/alert/alert";
import Modal from "@ui/modal/modal";
import PageMeta from "@common/pages/page-meta";

interface FormState {
  key: string;
  text: string;
  description: string;
}

const emptyForm: FormState = { key: "", text: "", description: "" };

const MessageTemplatesPage: React.FC = () => {
  const { templates, loading, saving, error, fetchAll, create, update, remove } =
    useMessageTemplates();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const openCreate = () => {
    setEditingTemplate(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (t: MessageTemplate) => {
    setEditingTemplate(t);
    setForm({ key: t.key, text: t.text, description: t.description ?? "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    setForm(emptyForm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await remove(id);
    if (ok) {
      setSuccessMsg("Template eliminado.");
      setTimeout(() => setSuccessMsg(null), 3000);
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Templates" description="Plantillas de mensajes" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400">
            Templates de Mensajes
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Mensajes predefinidos que usa el agente de WhatsApp.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="mr-1.5 size-4" />
          Nuevo template
        </Button>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}
      {successMsg && <Alert variant="success" title="Listo" message={successMsg} />}

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Cargando templates...
          </div>
        ) : templates.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3 text-center text-gray-400">
            <MessageSquareText className="size-10 opacity-40" />
            <p className="text-sm">No hay templates. Crea uno con el botón de arriba.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/[0.02]">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400 w-48">
                  Clave
                </th>
                <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                  Descripción
                </th>
                <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                  Mensaje
                </th>
                <th className="px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400 w-28">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {templates.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <td className="px-5 py-4 align-top">
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded font-mono">
                      {t.key}
                    </code>
                  </td>
                  <td className="px-5 py-4 align-top text-gray-500 dark:text-gray-400 text-xs">
                    {t.description ?? "—"}
                  </td>
                  <td className="px-5 py-4 align-top text-gray-700 dark:text-gray-300 max-w-md">
                    <p className="line-clamp-2 text-xs">{t.text}</p>
                  </td>
                  <td className="px-5 py-4 align-top text-right">
                    {deleteConfirmId === t.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Confirmar eliminación"
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
                          onClick={() => openEdit(t)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 dark:hover:text-brand-400"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(t.id)}
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
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-lg p-6 sm:p-8 mx-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5">
          {editingTemplate ? "Editar template" : "Nuevo template"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-500">Clave única</Label>
            <Input
              name="key"
              placeholder="ej. saludo_bienvenida"
              value={form.key}
              onChange={handleChange}
              disabled={!!editingTemplate || saving}
              required
            />
            {!editingTemplate && (
              <p className="mt-1 text-xs text-gray-400">
                Identificador en snake_case, no se puede cambiar después.
              </p>
            )}
          </div>
          <div>
            <Label className="text-gray-500">Descripción</Label>
            <Input
              name="description"
              placeholder="¿Para qué se usa este mensaje?"
              value={form.description}
              onChange={handleChange}
              disabled={saving}
            />
          </div>
          <div>
            <Label className="text-gray-500">Mensaje</Label>
            <textarea
              name="text"
              value={form.text}
              onChange={handleChange}
              rows={4}
              required
              disabled={saving}
              placeholder="Escribe el mensaje que enviará el agente..."
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Guardando..." : editingTemplate ? "Guardar cambios" : "Crear template"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MessageTemplatesPage;
