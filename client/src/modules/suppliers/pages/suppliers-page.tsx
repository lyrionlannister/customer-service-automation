import { Plus, Pencil, Search, Trash2, X, Check } from "lucide-react";

import Alert from "@ui/alert/alert";
import Button from "@ui/button/button";
import Input from "@ui/inputs/input";
import Label from "@ui/inputs/label";
import Modal from "@ui/modal/modal";
import PageMeta from "@common/pages/page-meta";

import { useSuppliers } from "../hooks/use-suppliers";
import { useSuppliersPage } from "../hooks/use-suppliers-page";

const SuppliersPage = () => {
  const { suppliers, loading, saving, error, fetchAll, create, update, remove } = useSuppliers();

  const {
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
  } = useSuppliersPage({
    suppliers,
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
      <PageMeta title="Proveedores" description="Catálogo de proveedores por tenant" />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400">Proveedores</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona el catálogo de proveedores disponible para cada tenant.
          </p>
        </div>

        <Button variant="primary" onClick={openCreate}>
          <Plus className="mr-1.5 size-4" />
          Nuevo proveedor
        </Button>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}
      {successMsg && <Alert variant="success" title="Listo" message={successMsg} />}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar proveedor"
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Cargando proveedores...</div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center text-gray-400">
            <Search className="size-10 opacity-40" />
            <p className="text-sm">No hay proveedores para este tenant.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/2">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Nombre</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Teléfono</th>
                <th className="w-28 px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-white/2">
                  <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">{supplier.name}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{supplier.phone || "—"}</td>
                  <td className="px-5 py-4 text-right">
                    {deleteConfirmId === supplier.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDelete(supplier.id)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Confirmar eliminación"
                        >
                          <Check className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(supplier)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/30 dark:hover:text-brand-400"
                          title="Editar"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(supplier.id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                          title="Eliminar"
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
        <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-100">
          {editingSupplier ? "Editar proveedor" : "Nuevo proveedor"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-500">Nombre</Label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ej. Tecnomax"
              required
            />
          </div>

          <div>
            <Label className="text-gray-500">Teléfono</Label>
            <Input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Ej. 3195083168"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingSupplier ? "Guardar cambios" : "Crear proveedor"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuppliersPage;
