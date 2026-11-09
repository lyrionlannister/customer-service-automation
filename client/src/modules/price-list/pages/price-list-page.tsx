import { useNavigate, useLocation } from "react-router";
import { Tags, Upload, Plus, Pencil, Trash2, X, Check, Search } from "lucide-react";

import { usePriceList } from "../hooks/use-price-list";
import { usePriceListPage } from "../hooks/use-price-list-page";
import { useSuppliers } from "@modules/suppliers/hooks/use-suppliers";
import Alert from "@ui/alert/alert";
import Button from "@ui/button/button";
import Input from "@ui/inputs/input";
import Label from "@ui/inputs/label";
import Modal from "@ui/modal/modal";
import PageMeta from "@common/pages/page-meta";

const formatPrice = (value: number) => `$${Number(value).toLocaleString("es-MX", { minimumFractionDigits: 0 })}`;

const PriceListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, loading, saving, error, fetchAll, create, update, remove } = usePriceList();
  const { suppliers, fetchAll: fetchSuppliers } = useSuppliers();

  const initialSuccessMessage =
    location.state?.imported !== undefined ? `PDF importado: ${location.state.imported} items cargados.` : null;

  const {
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
  } = usePriceListPage({
    items,
    suppliers,
    fetchAll,
    fetchSuppliers,
    create,
    update,
    remove,
    loading,
    saving,
    error,
    initialSuccessMessage,
  });

  return (
    <div className="space-y-6">
      <PageMeta title="Lista de Precios" description="Lista de precios de productos" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400">Lista de Precios</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {items.length > 0 ? `${items.length} items en total.` : "Sin items cargados."}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/price-list/import")}>
            <Upload className="mr-1.5 size-4" />
            Importar PDF
          </Button>
          <Button variant="primary" onClick={openCreate}>
            <Plus className="mr-1.5 size-4" />
            Nuevo item
          </Button>
        </div>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}
      {successMsg && <Alert variant="success" title="Listo" message={successMsg} />}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar modelo..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Todos", ...suppliers.map((supplier) => supplier.name)].map((supplier) => (
              <button
                key={supplier}
                onClick={() => setActiveSupplier(supplier)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeSupplier === supplier
                    ? "bg-brand-600 text-white dark:bg-brand-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {supplier}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => setActiveBrand(brand)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeBrand === brand
                  ? "bg-brand-600 text-white dark:bg-brand-500"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Cargando lista de precios...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center text-gray-400">
            <Tags className="size-10 opacity-40" />
            <p className="text-sm">{items.length === 0 ? "No hay items. Importa un PDF o agrega manualmente." : "Sin resultados para esa búsqueda."}</p>
          </div>
        ) : (
          <div className="max-h-[calc(100vh-22rem)] min-h-[320px] overflow-y-auto overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="sticky top-0 z-10 border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Marca</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Modelo</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400 w-36">Proveedor</th>
                  <th className="px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400 w-36">Precio</th>
                  <th className="px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400 w-28">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/2">
                    <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">{item.brand}</td>
                    <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">{item.model}</td>
                    <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">{item.supplier?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-right text-gray-700 dark:text-gray-300 tabular-nums">{formatPrice(item.price)}</td>
                    <td className="px-5 py-3 text-right">
                      {deleteConfirmId === item.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleDelete(item.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                            <Check className="size-4" />
                          </button>
                          <button onClick={() => setDeleteConfirmId(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <X className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-gray-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/30">
                            <Pencil className="size-4" />
                          </button>
                          <button onClick={() => setDeleteConfirmId(item.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-md p-6 sm:p-8 mx-4">
        <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-100">{editingItem ? "Editar item" : "Nuevo item"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-500">Marca</Label>
              <Input name="brand" placeholder="Samsung" value={form.brand} onChange={handleChange} required disabled={saving} />
            </div>
            <div>
              <Label className="text-gray-500">Modelo</Label>
              <Input name="model" placeholder="A32 5G" value={form.model} onChange={handleChange} required disabled={saving} />
            </div>
          </div>
          <div>
            <Label className="text-gray-500">Proveedor</Label>
            <select
              name="supplierId"
              value={form.supplierId}
              onChange={(event) => setForm((prev) => ({ ...prev, supplierId: event.target.value }))}
              required
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              <option value="" disabled>Seleccionar proveedor</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-gray-500">Precio</Label>
            <Input name="price" type="number" placeholder="200" value={form.price} onChange={handleChange} required disabled={saving} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={closeModal} disabled={saving}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? "Guardando..." : editingItem ? "Guardar cambios" : "Crear item"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PriceListPage;
