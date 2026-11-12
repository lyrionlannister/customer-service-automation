import { Repository } from "typeorm";
import { CashSession } from "../entities/cash-session.entity.js";
import { TenantScopedDao } from "../../../core/daos/tenant-scoped.dao.js";

export class CashSessionDao extends TenantScopedDao<CashSession> {
  constructor(repository: Repository<CashSession>) {
    super(repository);
  }

  async findOpenByLocal(localId: string): Promise<CashSession | null> {
    return this.scoped()
      .andWhere("entity.localId = :localId", { localId })
      .andWhere("entity.status = 'open'")
      .getOne();
  }

  async findAllOrdered(): Promise<CashSession[]> {
    return this.scoped().orderBy("entity.openedAt", "DESC").getMany();
  }
}
