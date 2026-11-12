import { describe, expect, it } from "vitest";
import { utils, write } from "xlsx";
import { parseInventoryImportFile } from "../../../src/inventory/utils/inventory-import-parser.js";

function toCsvBuffer(rows: string[]): Buffer {
  return Buffer.from(rows.join("\n"), "utf-8");
}

function toXlsxBuffer(rows: Record<string, unknown>[]): Buffer {
  const sheet = utils.json_to_sheet(rows);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, sheet, "Sheet1");
  return write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

describe("parseInventoryImportFile", () => {
  it("parsea un CSV con encabezados en español, con cantidad inicial opcional", () => {
    const csv = toCsvBuffer([
      "Nombre,SKU,Tipo,Precio Costo,Precio Venta,Cantidad",
      "Funda iPhone 13,FND-13,accesorio,50,120,10",
      "Pantalla A52,SCR-A52,refaccion,500,900,",
    ]);

    const { rows, errors } = parseInventoryImportFile(csv);

    expect(errors).toEqual([]);
    expect(rows).toEqual([
      { name: "Funda iPhone 13", sku: "FND-13", kind: "accessory", costPrice: 50, salePrice: 120, quantity: 10 },
      { name: "Pantalla A52", sku: "SCR-A52", kind: "part", costPrice: 500, salePrice: 900, quantity: 0 },
    ]);
  });

  it("parsea un XLSX con encabezados en inglés", () => {
    const xlsx = toXlsxBuffer([
      { name: "Cable USB-C", sku: "CBL-1", kind: "accessory", costPrice: 20, salePrice: 60, quantity: 5 },
    ]);

    const { rows, errors } = parseInventoryImportFile(xlsx);

    expect(errors).toEqual([]);
    expect(rows).toEqual([
      { name: "Cable USB-C", sku: "CBL-1", kind: "accessory", costPrice: 20, salePrice: 60, quantity: 5 },
    ]);
  });

  it("reporta filas inválidas por número de fila en vez de importarlas a medias", () => {
    const csv = toCsvBuffer([
      "Nombre,Precio Venta",
      "Sin precio,",
      ",100",
    ]);

    const { rows, errors } = parseInventoryImportFile(csv);

    expect(rows).toEqual([]);
    expect(errors).toEqual([
      "Fila 2: precio de venta inválido",
      "Fila 3: falta el nombre",
    ]);
  });
});
