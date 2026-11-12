import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { Upload, FileText, X, Loader2, Plus, Trash2 } from "lucide-react";
import { useSuppliers } from "@commerce/suppliers/hooks/use-suppliers";
import { useImportStaging, type StagingRow } from "../hooks/use-import-staging";
import Button from "@ui/button/button";
import Input from "@ui/inputs/input";
import Label from "@ui/inputs/label";
import Alert from "@ui/alert/alert";
import PageMeta from "@common/pages/page-meta";

type Step = "select" | "processing" | "preview";

const POLL_INTERVAL_MS = 2500;

const ImportPriceListPage: React.FC = () => {
  const navigate = useNavigate();
  const { suppliers, loading: loadingSuppliers, fetchAll: fetchSuppliers } = useSuppliers();
  const { uploading, saving, error, upload, fetchById, updateRows, commit, discard } =
    useImportStaging();

  const [step, setStep] = useState<Step>("select");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [supplierId, setSupplierId] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [importId, setImportId] = useState<string | null>(null);
  const [rows, setRows] = useState<StagingRow[]>([]);
  const [stagingError, setStagingError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  useEffect(() => {
    if (suppliers.length > 0 && !supplierId) {
      setSupplierId(suppliers[0].id);
    }
  }, [suppliers, supplierId]);

  useEffect(() => {
    if (step !== "processing" || !importId) return;
    const interval = setInterval(async () => {
      const record = await fetchById(importId);
      if (!record) return;
      if (record.status === "ready") {
        setRows(record.rows);
        setStep("preview");
      } else if (record.status === "error") {
        setStagingError(record.error ?? "La IA no pudo procesar el archivo");
        setStep("select");
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [step, importId, fetchById]);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setStagingError(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile || !supplierId) return;
    const newImportId = await upload(selectedFile, supplierId);
    if (!newImportId) return;
    setImportId(newImportId);
    setStep("processing");
  };

  const updateRow = (index: number, patch: Partial<StagingRow>) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addRow = () => setRows((prev) => [...prev, { brand: "", model: "", price: 0 }]);
  const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

  const handleConfirm = async () => {
    if (!importId) return;
    const ok = await updateRows(importId, rows);
    if (!ok) return;
    const result = await commit(importId);
    if (!result) return;
    navigate("/admin/price-list", { state: { imported: result.imported } });
  };

  const handleDiscard = async () => {
    if (importId) await discard(importId);
    setImportId(null);
    setRows([]);
    setSelectedFile(null);
    setStep("select");
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Importar lista de precios" description="Importar lista de precios con IA" />
      <div>
        <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400">
          Importar lista de precios
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Sube un PDF o Excel: una IA identifica marca/modelo/precio y revisas el resultado antes de confirmar.
        </p>
      </div>

      {(error || stagingError) && (
        <Alert variant="error" title="Error" message={error ?? stagingError ?? ""} />
      )}

      {step === "select" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3 space-y-6">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Proveedor
            </p>
            <div className="max-w-sm">
              <Label className="text-gray-500">Proveedor</Label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                disabled={loadingSuppliers}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 disabled:opacity-50"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Archivo (PDF o Excel)
            </p>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 cursor-pointer transition-colors ${
                isDragging
                  ? "border-brand-400 bg-brand-50 dark:border-brand-500 dark:bg-brand-950/20"
                  : "border-gray-300 hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-brand-700 dark:hover:bg-white/2"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = "";
                }}
              />
              {selectedFile ? (
                <>
                  <FileText className="size-10 text-brand-500" />
                  <div className="text-center">
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </>
              ) : (
                <>
                  <Upload className="size-10 text-gray-400" />
                  <div className="text-center">
                    <p className="font-medium text-gray-600 dark:text-gray-300">
                      Arrastra un archivo aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Tamaño máximo: 20 MB</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/admin/price-list")} disabled={uploading}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!selectedFile || !supplierId || uploading}
            >
              <Upload className="mr-1.5 size-4" />
              {uploading ? "Enviando..." : "Procesar con IA"}
            </Button>
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-white/3 flex flex-col items-center gap-4">
          <Loader2 className="size-8 text-brand-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            La IA está identificando marca, modelo y precio en el archivo...
          </p>
        </div>
      )}

      {step === "preview" && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {rows.length} fila(s) detectadas. Revisa y corrige antes de confirmar.
            </p>
            <Button variant="outline" onClick={addRow}>
              <Plus className="mr-1.5 size-4" />
              Agregar fila
            </Button>
          </div>
          <div className="max-h-[calc(100vh-26rem)] min-h-[240px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Marca
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Modelo
                  </th>
                  <th className="px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400 w-36">
                    Precio
                  </th>
                  <th className="px-5 py-3 w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td className="px-5 py-2">
                      <Input
                        value={row.brand}
                        onChange={(e) => updateRow(index, { brand: e.target.value })}
                      />
                    </td>
                    <td className="px-5 py-2">
                      <Input
                        value={row.model}
                        onChange={(e) => updateRow(index, { model: e.target.value })}
                      />
                    </td>
                    <td className="px-5 py-2">
                      <Input
                        type="number"
                        value={String(row.price)}
                        onChange={(e) => updateRow(index, { price: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td className="px-5 py-2 text-right">
                      <button
                        onClick={() => removeRow(index)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
            <Button variant="outline" onClick={handleDiscard} disabled={saving}>
              Descartar
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={saving || rows.length === 0}>
              {saving ? "Confirmando..." : "Confirmar importación"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportPriceListPage;
