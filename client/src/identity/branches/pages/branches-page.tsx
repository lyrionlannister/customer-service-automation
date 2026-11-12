import { Plus, Pencil, Store } from "lucide-react";

import Alert from "@ui/alert/alert";
import Button from "@ui/button/button";
import Input from "@ui/inputs/input";
import Label from "@ui/inputs/label";
import Modal from "@ui/modal/modal";
import Toggle from "@ui/toggle/toggle";
import PageMeta from "@common/pages/page-meta";
import useBranch from "@common/hooks/use-branch";

import { useBranches } from "../hooks/use-branches";
import { useBranchesPage } from "../hooks/use-branches-page";

const BranchesPage = () => {
  const { branches, loading, saving, error, fetchAll, create, update, setActive } = useBranches();
  const { refreshBranches } = useBranch();

  const { isModalOpen, editingBranch, form, successMsg, openCreate, openEdit, closeModal, handleChange, handleSubmit, handleToggleActive } =
    useBranchesPage({ fetchAll, create, update, setActive, refreshBranches });

  return (
    <div className="space-y-6">
      <PageMeta title="Sucursales" description="Sucursales del tenant" />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400">Sucursales</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Administra las sucursales disponibles y cuál está activa en el selector de arriba.
          </p>
        </div>

        <Button variant="primary" onClick={openCreate}>
          <Plus className="mr-1.5 size-4" />
          Nueva sucursal
        </Button>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}
      {successMsg && <Alert variant="success" title="Listo" message={successMsg} />}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Cargando sucursales...</div>
        ) : branches.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center text-gray-400">
            <Store className="size-10 opacity-40" />
            <p className="text-sm">No hay sucursales registradas todavía.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/2">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Nombre</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Dirección</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Teléfono</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Activa</th>
                <th className="w-16 px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Editar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {branches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50 dark:hover:bg-white/2">
                  <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">{branch.name}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{branch.address || "—"}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{branch.phone || "—"}</td>
                  <td className="px-5 py-4">
                    <Toggle checked={branch.isActive} onChange={() => handleToggleActive(branch)} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => openEdit(branch)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/30 dark:hover:text-brand-400"
                      title="Editar"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-lg p-6 sm:p-8 mx-4">
        <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-100">
          {editingBranch ? "Editar sucursal" : "Nueva sucursal"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-500">Nombre</Label>
            <Input name="name" value={form.name} onChange={handleChange} placeholder="Ej. Sucursal Centro" required disabled={saving} />
          </div>
          <div>
            <Label className="text-gray-500">Dirección</Label>
            <Input name="address" value={form.address} onChange={handleChange} placeholder="Calle y número" disabled={saving} />
          </div>
          <div>
            <Label className="text-gray-500">Teléfono</Label>
            <Input name="phone" value={form.phone} onChange={handleChange} placeholder="Ej. 833 123 4567" disabled={saving} />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {editingBranch ? "Guardar cambios" : "Crear sucursal"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BranchesPage;
