import { Repository } from "typeorm";
import { RepairNote } from "../entities/repair-note.entity.js";
import { TenantScopedDao } from "../../daos/tenant-scoped.dao.js";

export class RepairNoteDao extends TenantScopedDao<RepairNote> {
  constructor(repository: Repository<RepairNote>) {
    super(repository);
  }

  async findAllOrdered(): Promise<RepairNote[]> {
    return this.scoped().orderBy("entity.controlNumber", "DESC").getMany();
  }

  async findByControlNumber(controlNumber: number): Promise<RepairNote | null> {
    return this.scoped().andWhere("entity.controlNumber = :controlNumber", { controlNumber }).getOne();
  }
}
