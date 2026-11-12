import { Repository } from "typeorm";
import { InventoryItem } from "../entities/inventory-item.entity.js";
import { TenantScopedDao } from "../../daos/tenant-scoped.dao.js";

export class InventoryItemDao extends TenantScopedDao<InventoryItem> {
  constructor(repository: Repository<InventoryItem>) {
    super(repository);
  }

  async findAllOrdered(): Promise<InventoryItem[]> {
    return this.scoped().orderBy("entity.name", "ASC").getMany();
  }
}
