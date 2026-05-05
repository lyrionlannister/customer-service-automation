import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { Upload, FileText, X } from "lucide-react";
import { useSuppliers } from "@modules/suppliers/hooks/use-suppliers";
import { usePriceList } from "../hooks/use-price-list";
import Button from "@ui/button/button";
import Label from "@ui/inputs/label";
import Alert from "@ui/alert/alert";
import PageMeta from "@common/pages/page-meta";

const ImportPriceListPage: React.FC = () => {
  const navigate = useNavigate();
  const { suppliers, loading: loadingSuppliers, fetchAll: fetchSuppliers } = useSuppliers();
  const { uploading, error, uploadPdf } = usePriceList();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [supplierId, setSupplierId] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  useEffect(() => {
    if (suppliers.length > 0 && !supplierId) {
      setSupplierId(suppliers[0].id);
    }
  }, [suppliers, supplierId]);

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") return;
    setSelectedFile(file);
    setInfoMsg(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleSubmit = async () => {
    if (!selectedFile || !supplierId) return;
    const result = await uploadPdf(selectedFile, supplierId);
    if (!result) return;
    if (result.message) {
      setInfoMsg(result.message);
    } else if (result.imported !== undefined) {
      navigate("/admin/price-list", { state: { imported: result.imported } });
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Importar PDF" description="Importar lista de precios desde PDF" />
      <div>
        <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400">
          Importar PDF
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Selecciona el proveedor y sube el archivo de lista de precios.
        </p>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}

      {infoMsg && (
        <Alert variant="info" title="Información" message={infoMsg} />
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] space-y-6">

        {/* Proveedor */}
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

        {/* Archivo */}
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Archivo PDF
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
                : "border-gray-300 hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-brand-700 dark:hover:bg-white/[0.02]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
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
                    Arrastra un PDF aquí o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Tamaño máximo: 20 MB</p>
                </div>
              </>
            )}
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/price-list")}
            disabled={uploading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedFile || !supplierId || uploading}
          >
            <Upload className="mr-1.5 size-4" />
            {uploading ? "Importando..." : "Importar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImportPriceListPage;
