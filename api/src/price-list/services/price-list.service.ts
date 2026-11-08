import { PriceListDao } from "../daos/price-list.dao.js";
import { PriceListItem } from "../entities/price-list-item.entity.js";
import { parsePdfPriceList } from "../utils/pdf-parser.js";
import { parseTecnomaxPdf } from "../utils/tecnomax-pdf-parser.js";

type CreatePayload = Omit<PriceListItem, "id" | "createdAt" | "updatedAt" | "supplier">;
type UpdatePayload = Partial<CreatePayload>;

export class PriceListService {
  constructor(private dao: PriceListDao) {}

  async getAll(): Promise<PriceListItem[]> {
    return this.dao.findAllOrdered();
  }

  async search(query: string): Promise<PriceListItem[]> {
    return this.dao.searchByModel(query);
  }

  async create(data: CreatePayload): Promise<PriceListItem> {
    return this.dao.create(data as Partial<PriceListItem>);
  }

  async update(id: string, data: UpdatePayload): Promise<PriceListItem | null> {
    return this.dao.update(id, data as Partial<PriceListItem>);
  }

  async delete(id: string): Promise<boolean> {
    return this.dao.delete(id);
  }

  async importFromPdf(buffer: Buffer, supplierId: string, supplierName = ""): Promise<{ imported: number }> {
    console.log("[service] importFromPdf iniciado, buffer size:", buffer.length);
    const nameLC = supplierName.toLowerCase();
    if (nameLC !== "" && nameLC !== "mn refacciones" && !nameLC.includes("tecnomax")) {
      throw new Error(`Proveedor no soportado para importación PDF: ${supplierName}`);
    }
    const parsed = nameLC.includes("tecnomax")
      ? await parseTecnomaxPdf(buffer)
      : await parsePdfPriceList(buffer);
    console.log("[service] parsed.length:", parsed.length);
    if (parsed.length === 0) {
      throw new Error("No se encontraron items en el PDF. Verifica el formato.");
    }
    console.log("[service] Borrando items del proveedor", supplierId);
    await this.dao.deleteBySupplier(supplierId);
    console.log("[service] Insertando", parsed.length, "items...");
    const items = parsed.map((item) => ({ ...item, supplierId }));
    await this.dao.bulkCreate(items as Partial<PriceListItem>[]);
    console.log("[service] Inserción completada");
    return { imported: parsed.length };
  }
}
