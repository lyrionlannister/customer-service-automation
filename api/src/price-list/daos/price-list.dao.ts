import { Repository, ILike } from "typeorm";
import { PriceListItem } from "../entities/price-list-item.entity.js";
import { BaseDao } from "../../daos/base.dao.js";

export class PriceListDao extends BaseDao<PriceListItem> {
  constructor(repository: Repository<PriceListItem>) {
    super(repository);
  }

  async findAllOrdered(): Promise<PriceListItem[]> {
    return this.repository.find({
      relations: ["supplier"],
      order: { brand: "ASC", model: "ASC" },
    });
  }

  async searchByModel(query: string): Promise<PriceListItem[]> {
    return this.repository.find({
      relations: ["supplier"],
      where: { model: ILike(`%${query}%`) },
      order: { brand: "ASC", model: "ASC" },
      take: 20,
    });
  }

  async deleteBySupplier(supplierId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .where("id_proveedor = :supplierId", { supplierId })
      .execute();
  }

  async bulkCreate(items: Partial<PriceListItem>[]): Promise<void> {
    const entities = items.map((item) => this.repository.create(item as PriceListItem));
    await this.repository.save(entities, { chunk: 100 });
  }
}
