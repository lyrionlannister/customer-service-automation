import { Repository } from "typeorm";
import { Quote } from "../entities/quote.entity.js";
import { TenantScopedDao } from "../../../core/daos/tenant-scoped.dao.js";

export class QuoteDao extends TenantScopedDao<Quote> {
  constructor(repository: Repository<Quote>) {
    super(repository);
  }

  async findAllOrdered(): Promise<Quote[]> {
    return this.scoped().orderBy("entity.createdAt", "DESC").getMany();
  }
}
