import { Repository } from "typeorm";
import { CashMovement } from "../entities/cash-movement.entity.js";
import { TenantScopedDao } from "../../daos/tenant-scoped.dao.js";

export class CashMovementDao extends TenantScopedDao<CashMovement> {
  constructor(repository: Repository<CashMovement>) {
    super(repository);
  }

  async findBySession(cashSessionId: string): Promise<CashMovement[]> {
    return this.scoped()
      .andWhere("entity.cashSessionId = :cashSessionId", { cashSessionId })
      .orderBy("entity.createdAt", "ASC")
      .getMany();
  }
}
