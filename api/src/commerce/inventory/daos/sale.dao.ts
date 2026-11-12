import { Repository } from "typeorm";
import { Sale } from "../entities/sale.entity.js";
import { TenantScopedDao } from "../../../core/daos/tenant-scoped.dao.js";

export class SaleDao extends TenantScopedDao<Sale> {
  constructor(repository: Repository<Sale>) {
    super(repository);
  }

  async findAllOrdered(): Promise<Sale[]> {
    return this.scoped().orderBy("entity.createdAt", "DESC").getMany();
  }
}
