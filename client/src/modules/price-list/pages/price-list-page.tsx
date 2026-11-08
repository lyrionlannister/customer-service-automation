import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Tags,
  Upload,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Search,
} from "lucide-react";
import { usePriceList, type PriceListItem } from "../hooks/use-price-list";
import { useSuppliers } from "@modules/suppliers/hooks/use-suppliers";
import Button from "@ui/button/button";
import Input from "@ui/inputs/input";
import Label from "@ui/inputs/label";
import Alert from "@ui/alert/alert";
import Modal from "@ui/modal/modal";
import PageMeta from "@common/pages/page-meta";

type FormState = {
  brand: string;
  model: string;
  price: string;
  supplierId: string;
};

const emptyForm: FormState = { brand: "", model: "", price: "", supplierId: "" };

const formatPrice = (v: number) =>
  `$${Number(v).toLocaleString("es-MX", { minimumFractionDigits: 0 })}`;

const PriceListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, loading, saving, error, fetchAll, create, update, remove } = usePriceList();
  const { suppliers, fetchAll: fetchSuppliers } = useSuppliers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceListItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(
    location.state?.imported !== undefined
      ? `PDF importado: ${location.state.imported} items cargados.`
      : null,
  );
  const [search, setSearch] = useState("");
  const [activeBrand, setActiveBrand] = useState<string>("Todos");
  const [activeSupplier, setActiveSupplier] = useState<string>("Todos");

  useEffect(() => {
    fetchAll();
    fetchSuppliers();
  }, [fetchAll, fetchSuppliers]);

  const brands = useMemo(() => {
    const set = new Set(items.map((i) => i.brand));
    return ["Todos", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchesBrand = activeBrand === "Todos" || i.brand === activeBrand;
      const matchesSupplier =
        activeSupplier === "Todos" || i.supplier?.name === activeSupplier;
      const matchesSearch =
        !search ||
        i.model.toLowerCase().includes(search.toLowerCase()) ||
        i.brand.toLowerCase().includes(search.toLowerCase());
      return matchesBrand && matchesSupplier && matchesSearch;
    });
  }, [items, activeBrand, activeSupplier, search]);

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
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
    setForm(emptyForm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const notify = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      brand: form.brand,
      model: form.model,
      price: parseFloat(form.price),
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

  return (
    <div className="space-y-6">
      <PageMeta title="Lista de Precios" description="Lista de precios de productos" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400">
            Lista de Precios
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {items.length > 0 ? `${items.length} items en total.` : "Sin items cargados."}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/price-list/import")}
          >
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

      {/* Filtros */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Todos", ...suppliers.map((s) => s.name)].map((s) => (
              <button
                key={s}
                onClick={() => setActiveSupplier(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeSupplier === s
                    ? "bg-brand-600 text-white dark:bg-brand-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setActiveBrand(b)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeBrand === b
                  ? "bg-brand-600 text-white dark:bg-brand-500"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Cargando lista de precios...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3 text-center text-gray-400">
            <Tags className="size-10 opacity-40" />
            <p className="text-sm">
              {items.length === 0
                ? "No hay items. Importa un PDF o agrega manualmente."
                : "Sin resultados para esa búsqueda."}
            </p>
          </div>
        ) : (
          <div className="max-h-[calc(100vh-22rem)] min-h-[320px] overflow-y-auto overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="sticky top-0 z-10 border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Marca
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Modelo
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400 w-36">
                    Proveedor
                  </th>
                  <th className="px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400 w-36">
                    Precio
                  </th>
                  <th className="px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400 w-28">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {item.brand}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">
                      {item.model}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {item.supplier?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-700 dark:text-gray-300 tabular-nums">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {deleteConfirmId === item.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
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
                            onClick={() => openEdit(item)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
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
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-md p-6 sm:p-8 mx-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5">
          {editingItem ? "Editar item" : "Nuevo item"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-500">Marca</Label>
              <Input
                name="brand"
                placeholder="Samsung"
                value={form.brand}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </div>
            <div>
              <Label className="text-gray-500">Modelo</Label>
              <Input
                name="model"
                placeholder="A32 5G"
                value={form.model}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </div>
          </div>
          <div>
            <Label className="text-gray-500">Proveedor</Label>
            <select
              name="supplierId"
              value={form.supplierId}
              onChange={(e) => setForm((prev) => ({ ...prev, supplierId: e.target.value }))}
              required
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              <option value="" disabled>
                Seleccionar proveedor
              </option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-gray-500">Precio</Label>
            <Input
              name="price"
              type="number"
              placeholder="200"
              value={form.price}
              onChange={handleChange}
              required
              disabled={saving}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Guardando..." : editingItem ? "Guardar cambios" : "Crear item"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PriceListPage;
