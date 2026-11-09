import { Repository } from "typeorm";
import { PriceListItem } from "../entities/price-list-item.entity.js";
import { TenantScopedDao } from "../../daos/tenant-scoped.dao.js";

export class PriceListDao extends TenantScopedDao<PriceListItem> {
  constructor(repository: Repository<PriceListItem>) {
    super(repository);
  }

  async findAllOrdered(): Promise<PriceListItem[]> {
    return this.scoped()
      .leftJoinAndSelect("entity.supplier", "supplier")
      .orderBy("entity.brand", "ASC")
      .addOrderBy("entity.model", "ASC")
      .getMany();
  }

  async searchByModel(query: string): Promise<PriceListItem[]> {
    return this.scoped()
      .leftJoinAndSelect("entity.supplier", "supplier")
      .andWhere("entity.model ILIKE :query", { query: `%${query}%` })
      .orderBy("entity.brand", "ASC")
      .addOrderBy("entity.model", "ASC")
      .take(20)
      .getMany();
  }

  async deleteBySupplier(supplierId: string): Promise<void> {
    const tenantId = this.currentTenantId();
    await this.repository
      .createQueryBuilder()
      .delete()
      .where("id_proveedor = :supplierId AND tenant_id = :tenantId", { supplierId, tenantId })
      .execute();
  }

  async bulkCreate(items: Partial<PriceListItem>[]): Promise<void> {
    const tenantId = this.currentTenantId();
    const entities = items.map((item) =>
      this.repository.create({ ...item, tenantId } as PriceListItem),
    );
    await this.repository.save(entities, { chunk: 100 });
  }
}
