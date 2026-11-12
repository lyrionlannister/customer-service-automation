import { ServiceTypeDao } from "../daos/service-type.dao.js";
import { ServiceType } from "../entities/service-type.entity.js";

// Defaults sembrados por tenant: los 5 historicos (ya eran booleans en
// repair_notes) + Software/Sistema (fallas de SO, pedido explicito del
// cliente). El tenant puede agregar mas desde la UI.
const SEED_SERVICE_TYPES = ["Reparación", "Mantenimiento", "Diagnóstico", "Revisión", "Mojado", "Software", "Sistema"];

export class ServiceTypeService {
  constructor(private dao: ServiceTypeDao) {}

  async getAll(): Promise<ServiceType[]> {
    return this.dao.findAllOrdered();
  }

  async create(name: string): Promise<ServiceType> {
    const trimmed = name?.trim();
    if (!trimmed) {
      throw new Error("El nombre del tipo de servicio es obligatorio");
    }
    const existing = await this.dao.findByName(trimmed);
    if (existing) return existing;
    return this.dao.create({ name: trimmed });
  }

  async seed(): Promise<void> {
    for (const name of SEED_SERVICE_TYPES) {
      const existing = await this.dao.findByName(name);
      if (!existing) {
        await this.dao.create({ name });
      }
    }
  }
}
