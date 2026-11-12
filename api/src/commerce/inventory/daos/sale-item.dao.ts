import { Repository } from "typeorm";
import { SaleItem } from "../entities/sale-item.entity.js";
import { TenantScopedDao } from "../../../core/daos/tenant-scoped.dao.js";

export class SaleItemDao extends TenantScopedDao<SaleItem> {
  constructor(repository: Repository<SaleItem>) {
    super(repository);
  }

  async findBySaleId(saleId: string): Promise<SaleItem[]> {
    return this.scoped().andWhere("entity.saleId = :saleId", { saleId }).getMany();
  }
}
