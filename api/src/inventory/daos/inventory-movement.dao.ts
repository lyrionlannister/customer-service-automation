import { Repository } from "typeorm";
import { InventoryMovement } from "../entities/inventory-movement.entity.js";
import { TenantScopedDao } from "../../daos/tenant-scoped.dao.js";

export class InventoryMovementDao extends TenantScopedDao<InventoryMovement> {
  constructor(repository: Repository<InventoryMovement>) {
    super(repository);
  }

  async findByItem(inventoryItemId: string): Promise<InventoryMovement[]> {
    return this.scoped()
      .andWhere("entity.inventoryItemId = :inventoryItemId", { inventoryItemId })
      .orderBy("entity.createdAt", "DESC")
      .getMany();
  }
}
