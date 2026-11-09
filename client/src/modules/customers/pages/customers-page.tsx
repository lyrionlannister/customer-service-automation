import { Plus, Pencil, Search, Trash2, X, Check, Smartphone, Users } from "lucide-react";

import Alert from "@ui/alert/alert";
import Button from "@ui/button/button";
import Input from "@ui/inputs/input";
import Label from "@ui/inputs/label";
import Modal from "@ui/modal/modal";
import PageMeta from "@common/pages/page-meta";

import { useCustomers } from "../hooks/use-customers";
import { useCustomersPage } from "../hooks/use-customers-page";

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

const CustomersPage = () => {
  const { customers, devices, loading, saving, error, fetchAll, fetchDevices, create, update, remove } =
    useCustomers();

  const {
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
  } = useCustomersPage({ customers, fetchAll, fetchDevices, create, update, remove });

  return (
    <div className="space-y-6">
      <PageMeta title="Clientes" description="Catálogo de clientes por tenant" />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400">Clientes</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona el catálogo de clientes y su historial de equipos.
          </p>
        </div>

        <Button variant="primary" onClick={openCreate}>
          <Plus className="mr-1.5 size-4" />
          Nuevo cliente
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
            placeholder="Buscar cliente"
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Cargando clientes...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center text-gray-400">
            <Users className="size-10 opacity-40" />
            <p className="text-sm">No hay clientes registrados todavía.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/2">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Nombre</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Teléfono</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th className="w-36 px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-white/2">
                  <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">{customer.name}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{customer.phone}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{customer.email || "—"}</td>
                  <td className="px-5 py-4 text-right">
                    {deleteConfirmId === customer.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDelete(customer.id)}
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
                          onClick={() => openHistory(customer)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/30 dark:hover:text-brand-400"
                          title="Historial de equipos"
                        >
                          <Smartphone className="size-4" />
                        </button>
                        <button
                          onClick={() => openEdit(customer)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/30 dark:hover:text-brand-400"
                          title="Editar"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(customer.id)}
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
          {editingCustomer ? "Editar cliente" : "Nuevo cliente"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-500">Nombre</Label>
            <Input name="name" value={form.name} onChange={handleChange} placeholder="Ej. Juan Pérez" required disabled={saving} />
          </div>
          <div>
            <Label className="text-gray-500">Teléfono</Label>
            <Input name="phone" value={form.phone} onChange={handleChange} placeholder="Ej. 833 123 4567" required disabled={saving} />
          </div>
          <div>
            <Label className="text-gray-500">Email (opcional)</Label>
            <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="cliente@correo.com" disabled={saving} />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {editingCustomer ? "Guardar cambios" : "Crear cliente"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(historyCustomer)} onClose={closeHistory} className="max-w-lg p-6 sm:p-8 mx-4">
        <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">
          Historial de equipos
        </h2>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">{historyCustomer?.name}</p>

        {devices.length === 0 ? (
          <p className="text-sm text-gray-400">Este cliente todavía no tiene notas de reparación registradas.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {devices.map((device) => (
              <li key={`${device.brand}-${device.model}`} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {device.brand} {device.model}
                  </p>
                  <p className="text-xs text-gray-400">
                    {device.notesCount} {device.notesCount === 1 ? "nota" : "notas"} · última: {formatDate(device.lastReceivedAt)} (#{device.controlNumber})
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end pt-4">
          <Button type="button" variant="outline" onClick={closeHistory}>
            Cerrar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CustomersPage;
