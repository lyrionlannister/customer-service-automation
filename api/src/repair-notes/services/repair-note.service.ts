import { RepairNoteDao } from "../daos/repair-note.dao.js";
import { LocalService } from "../../local/services/local.service.js";
import { RepairNote } from "../entities/repair-note.entity.js";

type CreatePayload = Omit<RepairNote, "id" | "controlNumber" | "createdAt" | "updatedAt">;
type UpdatePayload = Partial<Omit<RepairNote, "id" | "controlNumber" | "createdAt" | "updatedAt">>;

export class RepairNoteService {
  constructor(
    private repairNoteDao: RepairNoteDao,
    private localService: LocalService,
  ) {}

  async getAll(): Promise<RepairNote[]> {
    return this.repairNoteDao.findAllOrdered();
  }

  async getById(id: string): Promise<RepairNote | null> {
    return this.repairNoteDao.findById(id);
  }

  async create(data: CreatePayload): Promise<RepairNote> {
    const controlNumber = await this.localService.consumeControlNumber();
    return this.repairNoteDao.create({ ...data, controlNumber } as Partial<RepairNote>);
  }

  async update(id: string, data: UpdatePayload): Promise<RepairNote | null> {
    return this.repairNoteDao.update(id, data as Partial<RepairNote>);
  }

  async delete(id: string): Promise<boolean> {
    return this.repairNoteDao.delete(id);
  }
}
