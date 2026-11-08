import { Repository } from "typeorm";
import { QuoteItem } from "../entities/quote-item.entity.js";
import { TenantScopedDao } from "../../daos/tenant-scoped.dao.js";

export class QuoteItemDao extends TenantScopedDao<QuoteItem> {
  constructor(repository: Repository<QuoteItem>) {
    super(repository);
  }

  async findByQuoteId(quoteId: string): Promise<QuoteItem[]> {
    return this.scoped().andWhere("entity.quoteId = :quoteId", { quoteId }).getMany();
  }
}
