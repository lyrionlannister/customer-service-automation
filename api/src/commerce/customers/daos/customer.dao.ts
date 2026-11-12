import { Repository } from "typeorm";
import { Customer } from "../entities/customer.entity.js";
import { TenantScopedDao } from "../../../core/daos/tenant-scoped.dao.js";

export class CustomerDao extends TenantScopedDao<Customer> {
  constructor(repository: Repository<Customer>) {
    super(repository);
  }

  override async findAll(): Promise<Customer[]> {
    return this.scoped().orderBy("entity.name", "ASC").getMany();
  }
}
