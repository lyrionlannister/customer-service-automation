import { CustomerDao } from "../daos/customer.dao.js";
import { Customer } from "../entities/customer.entity.js";
import { RepairNoteDao } from "../../repair-notes/daos/repair-note.dao.js";

type CreatePayload = Pick<Customer, "name" | "phone" | "email">;
type UpdatePayload = Partial<CreatePayload>;

export interface CustomerDeviceHistoryEntry {
  brand: string;
  model: string;
  lastReceivedAt: string;
  controlNumber: number;
  notesCount: number;
}

export class CustomerService {
  constructor(
    private dao: CustomerDao,
    private repairNoteDao: RepairNoteDao,
  ) {}

  async getAll(): Promise<Customer[]> {
    return this.dao.findAll();
  }

  async getById(id: string): Promise<Customer | null> {
    return this.dao.findById(id);
  }

  async create(data: CreatePayload): Promise<Customer> {
    const name = data.name?.trim();
    const phone = data.phone?.trim();
    if (!name) throw new Error("El nombre del cliente es obligatorio");
    if (!phone) throw new Error("El teléfono del cliente es obligatorio");

    return this.dao.create({
      name,
      phone,
      email: data.email?.trim() || undefined,
    } as Partial<Customer>);
  }

  async update(id: string, data: UpdatePayload): Promise<Customer | null> {
    const payload: Partial<Customer> = {};

    if (data.name !== undefined) {
      const name = data.name.trim();
      if (!name) throw new Error("El nombre del cliente es obligatorio");
      payload.name = name;
    }
    if (data.phone !== undefined) {
      const phone = data.phone.trim();
      if (!phone) throw new Error("El teléfono del cliente es obligatorio");
      payload.phone = phone;
    }
    if (data.email !== undefined) payload.email = data.email?.trim() || undefined;

    return this.dao.update(id, payload);
  }

  async delete(id: string): Promise<boolean> {
    return this.dao.delete(id);
  }

  // No hay tabla de dispositivos propia: el historial se deriva de las notas
  // de reparacion ya ligadas al cliente (marca+modelo), deduplicado y
  // ordenado por la mas reciente -- una nota nueva ya es el registro, no
  // hace falta duplicar el dato en otra tabla.
  async getDeviceHistory(customerId: string): Promise<CustomerDeviceHistoryEntry[]> {
    const notes = await this.repairNoteDao.findByCustomerId(customerId);
    const byDevice = new Map<string, CustomerDeviceHistoryEntry>();

    for (const note of notes) {
      const key = `${note.brand.trim().toLowerCase()}|${note.model.trim().toLowerCase()}`;
      const existing = byDevice.get(key);
      if (existing) {
        existing.notesCount += 1;
        if (note.receivedAt > existing.lastReceivedAt) {
          existing.lastReceivedAt = note.receivedAt;
          existing.controlNumber = note.controlNumber;
        }
        continue;
      }
      byDevice.set(key, {
        brand: note.brand,
        model: note.model,
        lastReceivedAt: note.receivedAt,
        controlNumber: note.controlNumber,
        notesCount: 1,
      });
    }

    return Array.from(byDevice.values()).sort((a, b) => (a.lastReceivedAt < b.lastReceivedAt ? 1 : -1));
  }
}
