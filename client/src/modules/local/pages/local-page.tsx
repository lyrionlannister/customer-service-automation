import { useState, useEffect, useRef } from "react";
import { Store } from "lucide-react";
import { useLocal } from "../hooks/use-local";
import Input from "@ui/inputs/input";
import Label from "@ui/inputs/label";
import Button from "@ui/button/button";
import Alert from "@ui/alert/alert";
import PageMeta from "@common/pages/page-meta";

const LocalPage: React.FC = () => {
  const { local, loading, saving, saveSuccess, error, fetchLocal, updateLocal } = useLocal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    nextControlNumber: "1",
    cashRoundingUnit: "0",
    logo: "",
  });

  useEffect(() => {
    fetchLocal();
  }, [fetchLocal]);

  useEffect(() => {
    if (local) {
      setForm({
        name: local.name ?? "",
        address: local.address ?? "",
        phone: local.phone ?? "",
        nextControlNumber: String(local.nextControlNumber),
        cashRoundingUnit: String(local.cashRoundingUnit ?? 0),
        logo: local.logo ?? "",
      });
    }
  }, [local]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, logo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateLocal({
      name: form.name || undefined,
      address: form.address || undefined,
      phone: form.phone || undefined,
      nextControlNumber: parseInt(form.nextControlNumber, 10) || 1,
      cashRoundingUnit: parseFloat(form.cashRoundingUnit) || 0,
      logo: form.logo || undefined,
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Cargando configuración...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Mi Local" description="Configuración del local" />
      <div>
        <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400">
          Configuración del Local
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Datos que aparecerán en las notas de reparación impresas.
        </p>
      </div>

      {error && (
        <Alert variant="error" title="Error" message={error} />
      )}
      {saveSuccess && (
        <Alert variant="success" title="Guardado" message="Configuración actualizada correctamente." />
      )}

      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3 space-y-6">

          {/* Logo */}
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Logo del local
            </p>
            <div className="flex items-center gap-4">
              <div className="size-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900">
                {form.logo ? (
                  <img src={form.logo} alt="Logo" className="size-full object-contain" />
                ) : (
                  <Store className="size-8 text-gray-400" />
                )}
              </div>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {form.logo ? "Cambiar logo" : "Subir logo"}
                </Button>
                {form.logo && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm((prev) => ({ ...prev, logo: "" }))}
                  >
                    Quitar logo
                  </Button>
                )}
                <p className="text-xs text-gray-400">PNG, JPG. Recomendado: 200×200px.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Datos básicos */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label className="text-gray-500">Nombre del local</Label>
              <Input
                name="name"
                placeholder="Ej. Kaltra Fix"
                value={form.name}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
            <div>
              <Label className="text-gray-500">Teléfono</Label>
              <Input
                name="phone"
                placeholder="Ej. 833 266 2225"
                value={form.phone}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-gray-500">Dirección</Label>
              <Input
                name="address"
                placeholder="Ej. Benito Juárez 304 Local 107-109, Zona Centro"
                value={form.address}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Consecutivo */}
          <div className="max-w-xs">
            <Label className="text-gray-500">Número de control inicial</Label>
            <Input
              type="number"
              name="nextControlNumber"
              min="1"
              placeholder="1"
              value={form.nextControlNumber}
              onChange={handleChange}
              disabled={saving}
            />
            <p className="mt-1 text-xs text-gray-400">
              El próximo consecutivo que se asignará a una nota nueva.
            </p>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Redondeo de caja */}
          <div className="max-w-xs">
            <Label className="text-gray-500">Unidad de redondeo de caja (efectivo)</Label>
            <Input
              type="number"
              name="cashRoundingUnit"
              min="0"
              step="0.01"
              placeholder="0 = sin redondeo"
              value={form.cashRoundingUnit}
              onChange={handleChange}
              disabled={saving}
            />
            <p className="mt-1 text-xs text-gray-400">
              Ej. 0.50 redondea cobros en efectivo al 50 centavos más cercano. 0 desactiva el redondeo.
              Tarjeta y transferencia nunca redondean.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LocalPage;
