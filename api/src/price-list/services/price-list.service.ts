import { PriceListDao } from "../daos/price-list.dao.js";
import { PriceListItem } from "../entities/price-list-item.entity.js";

type CreatePayload = Omit<PriceListItem, "id" | "createdAt" | "updatedAt" | "supplier">;
type UpdatePayload = Partial<CreatePayload>;

export class PriceListService {
  constructor(private dao: PriceListDao) {}

  async getAll(): Promise<PriceListItem[]> {
    return this.dao.findAllOrdered();
  }

  async search(query: string): Promise<PriceListItem[]> {
    return this.dao.searchByModel(query);
  }

  async create(data: CreatePayload): Promise<PriceListItem> {
    return this.dao.create(data as Partial<PriceListItem>);
  }

  async update(id: string, data: UpdatePayload): Promise<PriceListItem | null> {
    return this.dao.update(id, data as Partial<PriceListItem>);
  }

  async delete(id: string): Promise<boolean> {
    return this.dao.delete(id);
  }

}
