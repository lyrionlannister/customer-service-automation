import { SupplierDao } from "../daos/supplier.dao.js";
import { Supplier } from "../entities/supplier.entity.js";

const SEED_SUPPLIERS = [
  { name: "Tecnomax", phone: "3195083168" },
  { name: "MN Refacciones", phone: "5587527124" },
];

export class SupplierService {
  constructor(private dao: SupplierDao) {}

  async getAll(): Promise<Supplier[]> {
    return this.dao.findAll();
  }

  async getById(id: string): Promise<Supplier | null> {
    return this.dao.findById(id);
  }

  async seed(): Promise<void> {
    const count = await this.dao.count();
    if (count > 0) return;
    for (const data of SEED_SUPPLIERS) {
      await this.dao.create(data);
    }
    console.log("Proveedores sembrados:", SEED_SUPPLIERS.map((s) => s.name).join(", "));
  }
}
