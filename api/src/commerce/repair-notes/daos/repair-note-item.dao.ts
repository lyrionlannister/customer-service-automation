import { Repository } from "typeorm";
import { RepairNoteItem } from "../entities/repair-note-item.entity.js";
import { TenantScopedDao } from "../../../core/daos/tenant-scoped.dao.js";

export class RepairNoteItemDao extends TenantScopedDao<RepairNoteItem> {
  constructor(repository: Repository<RepairNoteItem>) {
    super(repository);
  }

  async findByRepairNoteId(repairNoteId: string): Promise<RepairNoteItem[]> {
    return this.scoped().andWhere("entity.repairNoteId = :repairNoteId", { repairNoteId }).getMany();
  }
}
