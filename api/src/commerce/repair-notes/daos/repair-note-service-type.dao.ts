import { Repository } from "typeorm";
import { RepairNoteServiceType } from "../entities/repair-note-service-type.entity.js";
import { TenantScopedDao } from "../../../core/daos/tenant-scoped.dao.js";

export class RepairNoteServiceTypeDao extends TenantScopedDao<RepairNoteServiceType> {
  constructor(repository: Repository<RepairNoteServiceType>) {
    super(repository);
  }

  async findByRepairNoteId(repairNoteId: string): Promise<RepairNoteServiceType[]> {
    return this.scoped().andWhere("entity.repairNoteId = :repairNoteId", { repairNoteId }).getMany();
  }
}
