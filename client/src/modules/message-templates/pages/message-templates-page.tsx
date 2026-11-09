import { MessageSquareText, Plus, Pencil, Trash2, X, Check } from "lucide-react";

import { useMessageTemplates } from "../hooks/use-message-templates";
import { useMessageTemplatesPage } from "../hooks/use-message-templates-page";
import Alert from "@ui/alert/alert";
import Button from "@ui/button/button";
import Input from "@ui/inputs/input";
import Label from "@ui/inputs/label";
import Modal from "@ui/modal/modal";
import PageMeta from "@common/pages/page-meta";

const MessageTemplatesPage = () => {
  const { templates, loading, saving, error, fetchAll, create, update, remove } = useMessageTemplates();

  const {
    isModalOpen,
    editingTemplate,
    form,
    deleteConfirmId,
    setDeleteConfirmId,
    successMsg,
    openCreate,
    openEdit,
    closeModal,
    handleChange,
    handleSubmit,
    handleDelete,
  } = useMessageTemplatesPage({
    templates,
    loading,
    saving,
    error,
    fetchAll,
    create,
    update,
    remove,
  });

  return (
    <div className="space-y-6">
      <PageMeta title="Templates" description="Plantillas de mensajes" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400">Templates de Mensajes</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Mensajes predefinidos que usa el agente de WhatsApp.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="mr-1.5 size-4" />
          Nuevo template
        </Button>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}
      {successMsg && <Alert variant="success" title="Listo" message={successMsg} />}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Cargando templates...</div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center text-gray-400">
            <MessageSquareText className="size-10 opacity-40" />
            <p className="text-sm">No hay templates. Crea uno con el botón de arriba.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/2">
              <tr>
                <th className="w-48 px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Clave</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Descripción</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Mensaje</th>
                <th className="w-28 px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {templates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-white/2">
                  <td className="px-5 py-4 align-top">
                    <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-brand-600 dark:bg-gray-800 dark:text-brand-400">
                      {template.key}
                    </code>
                  </td>
                  <td className="px-5 py-4 align-top text-xs text-gray-500 dark:text-gray-400">{template.description ?? "—"}</td>
                  <td className="max-w-md px-5 py-4 align-top text-gray-700 dark:text-gray-300">
                    <p className="line-clamp-2 text-xs">{template.text}</p>
                  </td>
                  <td className="px-5 py-4 align-top text-right">
                    {deleteConfirmId === template.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleDelete(template.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" title="Confirmar eliminación">
                          <Check className="size-4" />
                        </button>
                        <button onClick={() => setDeleteConfirmId(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(template)} className="rounded-lg p-1.5 text-gray-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/30 dark:hover:text-brand-400">
                          <Pencil className="size-4" />
                        </button>
                        <button onClick={() => setDeleteConfirmId(template.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
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
        <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-100">{editingTemplate ? "Editar template" : "Nuevo template"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-500">Clave única</Label>
            <Input name="key" placeholder="ej. saludo_bienvenida" value={form.key} onChange={handleChange} disabled={!!editingTemplate || saving} required />
            {!editingTemplate && <p className="mt-1 text-xs text-gray-400">Identificador en snake_case, no se puede cambiar después.</p>}
          </div>
          <div>
            <Label className="text-gray-500">Descripción</Label>
            <Input name="description" placeholder="¿Para qué se usa este mensaje?" value={form.description} onChange={handleChange} disabled={saving} />
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
              className="w-full resize-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={closeModal} disabled={saving}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? "Guardando..." : editingTemplate ? "Guardar cambios" : "Crear template"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MessageTemplatesPage;
