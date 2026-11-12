import { Repository } from "typeorm";
import { Branch } from "../entities/branch.entity.js";
import { TenantScopedDao } from "../../../core/daos/tenant-scoped.dao.js";

export class BranchDao extends TenantScopedDao<Branch> {
  constructor(repository: Repository<Branch>) {
    super(repository);
  }

  override async findAll(): Promise<Branch[]> {
    return this.scoped().orderBy("entity.name", "ASC").getMany();
  }

  async count(): Promise<number> {
    return this.scoped().getCount();
  }
}
