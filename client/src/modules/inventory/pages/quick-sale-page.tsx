import { useEffect, useState } from "react";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { useSales, type PaymentMethod } from "../hooks/use-sales";
import { useInventory } from "../hooks/use-inventory";
import { useLocal } from "@modules/local/hooks/use-local";
import EmployeeSelect from "@common/components/employee-select";
import Button from "@ui/button/button";
import Input from "@ui/inputs/input";
import Label from "@ui/inputs/label";
import Select from "@ui/select/select";
import Alert from "@ui/alert/alert";
import PageMeta from "@common/pages/page-meta";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
};

type LineItem = { inventoryItemId: string; quantity: string; unitPrice: string };

const emptyLine: LineItem = { inventoryItemId: "", quantity: "1", unitPrice: "" };

const formatMoney = (v: number) => `$${Number(v).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

const QuickSalePage: React.FC = () => {
  const { creating, error, create } = useSales();
  const { items: inventoryItems, fetchAll: fetchInventory } = useInventory();
  const { local, fetchLocal } = useLocal();

  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [createdByEmployeeId, setCreatedByEmployeeId] = useState("");
  const [lines, setLines] = useState<LineItem[]>([{ ...emptyLine }]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
    fetchLocal();
  }, [fetchInventory, fetchLocal]);

  const updateLine = (index: number, patch: Partial<LineItem>) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const handleItemChange = (index: number, inventoryItemId: string) => {
    const item = inventoryItems.find((i) => i.id === inventoryItemId);
    updateLine(index, { inventoryItemId, unitPrice: item ? String(item.salePrice) : "" });
  };

  const addLine = () => setLines((prev) => [...prev, { ...emptyLine }]);
  const removeLine = (index: number) => setLines((prev) => prev.filter((_, i) => i !== index));

  const total = lines.reduce(
    (sum, line) => sum + (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0),
    0,
  );

  const resetForm = () => {
    setCustomerName("");
    setPaymentMethod("efectivo");
    setCreatedByEmployeeId("");
    setLines([{ ...emptyLine }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!local) return;
    const validLines = lines.filter((l) => l.inventoryItemId && Number(l.quantity) > 0);
    if (validLines.length === 0) return;

    const sale = await create({
      localId: local.id,
      customerName: customerName || undefined,
      paymentMethod,
      createdByEmployeeId: createdByEmployeeId || undefined,
      items: validLines.map((l) => ({
        inventoryItemId: l.inventoryItemId,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
      })),
    });

    if (sale) {
      setSuccessMsg(`Venta registrada por ${formatMoney(sale.totalValue)}.`);
      resetForm();
      fetchInventory();
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Venta Rápida" description="Venta directa de accesorios" />
      <div>
        <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400">Venta Rápida</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Venta de mostrador: cada item descuenta su stock automáticamente.
        </p>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}
      {successMsg && <Alert variant="success" title="Listo" message={successMsg} />}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Label className="text-gray-500">Cliente</Label>
            <Input placeholder="Opcional" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
          <div>
            <Label className="text-gray-500">Método de pago</Label>
            <Select
              value={paymentMethod}
              onChange={(value) => setPaymentMethod(value as PaymentMethod)}
              options={Object.entries(PAYMENT_LABELS).map(([value, label]) => ({ value, label }))}
            />
          </div>
          <div>
            <Label className="text-gray-500">Empleado</Label>
            <EmployeeSelect value={createdByEmployeeId} onChange={setCreatedByEmployeeId} />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-gray-500">Items</Label>
          {lines.map((line, index) => (
            <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Select
                  value={line.inventoryItemId}
                  onChange={(value) => handleItemChange(index, value)}
                  placeholder="Selecciona un item"
                  options={inventoryItems.map((i) => ({
                    value: i.id,
                    label: `${i.name} (stock: ${i.quantityOnHand})`,
                  }))}
                />
              </div>
              <div className="w-full sm:w-24">
                <Input
                  type="number"
                  placeholder="Cant."
                  value={line.quantity}
                  onChange={(e) => updateLine(index, { quantity: e.target.value })}
                />
              </div>
              <div className="w-full sm:w-32">
                <Input
                  type="number"
                  placeholder="Precio"
                  value={line.unitPrice}
                  onChange={(e) => updateLine(index, { unitPrice: e.target.value })}
                />
              </div>
              {lines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  className="p-2.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addLine}>
            <Plus className="mr-1.5 size-4" />
            Agregar item
          </Button>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
          <span className="text-xl font-semibold text-gray-800 dark:text-white/90">{formatMoney(total)}</span>
        </div>

        <Button type="submit" variant="primary" className="w-full" disabled={creating}>
          <ShoppingCart className="mr-1.5 size-4" />
          {creating ? "Registrando..." : "Registrar venta"}
        </Button>
      </form>
    </div>
  );
};

export default QuickSalePage;
