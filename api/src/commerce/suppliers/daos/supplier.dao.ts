import { Repository } from "typeorm";
import { Supplier } from "../entities/supplier.entity.js";
import { TenantScopedDao } from "../../../core/daos/tenant-scoped.dao.js";

export class SupplierDao extends TenantScopedDao<Supplier> {
  constructor(repository: Repository<Supplier>) {
    super(repository);
  }

  override async findAll(): Promise<Supplier[]> {
    return this.scoped().orderBy("entity.name", "ASC").getMany();
  }

  async findByName(name: string): Promise<Supplier | null> {
    return this.findOne({ name } as Partial<Supplier>);
  }

  async count(): Promise<number> {
    return this.scoped().getCount();
  }
}
