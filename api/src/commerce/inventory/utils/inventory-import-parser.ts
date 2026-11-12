import { read, utils } from "xlsx";
import type { InventoryItemKind } from "../entities/inventory-item.entity.js";

export interface InventoryImportRow {
  name: string;
  sku: string | null;
  kind: InventoryItemKind;
  costPrice: number;
  salePrice: number;
  quantity: number;
}

export interface InventoryImportResult {
  rows: InventoryImportRow[];
  errors: string[];
}

const HEADER_MAP: Record<string, keyof InventoryImportRow> = {
  nombre: "name",
  name: "name",
  sku: "sku",
  codigo: "sku",
  tipo: "kind",
  kind: "kind",
  preciocosto: "costPrice",
  costo: "costPrice",
  costprice: "costPrice",
  precioventa: "salePrice",
  precio: "salePrice",
  saleprice: "salePrice",
  cantidad: "quantity",
  stock: "quantity",
  quantity: "quantity",
};

function normalizeHeader(header: string): string {
  return header
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Lee un CSV o Excel (xlsx autodetecta el formato por el contenido del buffer). */
export function parseInventoryImportFile(buffer: Buffer): InventoryImportResult {
  const workbook = read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  const rows: InventoryImportRow[] = [];
  const errors: string[] = [];

  rawRows.forEach((raw, index) => {
    const mapped: Partial<Record<keyof InventoryImportRow, unknown>> = {};
    for (const [key, value] of Object.entries(raw)) {
      const canonical = HEADER_MAP[normalizeHeader(key)];
      if (canonical) mapped[canonical] = value;
    }

    const rowNumber = index + 2; // +1 por el encabezado, +1 por ser 1-indexado
    const name = String(mapped.name ?? "").trim();
    const salePriceRaw = mapped.salePrice;
    const salePrice = Number(salePriceRaw);

    if (!name) {
      errors.push(`Fila ${rowNumber}: falta el nombre`);
      return;
    }
    if (salePriceRaw === undefined || salePriceRaw === "" || !Number.isFinite(salePrice) || salePrice < 0) {
      errors.push(`Fila ${rowNumber}: precio de venta inválido`);
      return;
    }

    const kindRaw = normalizeHeader(String(mapped.kind ?? "accessory"));
    const kind: InventoryItemKind = kindRaw === "part" || kindRaw === "refaccion" ? "part" : "accessory";
    const costPrice = Number(mapped.costPrice) || 0;
    const quantity = Number(mapped.quantity) || 0;
    const sku = mapped.sku != null ? String(mapped.sku).trim() : "";

    rows.push({ name, sku: sku || null, kind, costPrice, salePrice, quantity });
  });

  return { rows, errors };
}
