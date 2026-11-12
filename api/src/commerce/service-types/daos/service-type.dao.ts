import { Repository } from "typeorm";
import { ServiceType } from "../entities/service-type.entity.js";
import { TenantScopedDao } from "../../../core/daos/tenant-scoped.dao.js";

export class ServiceTypeDao extends TenantScopedDao<ServiceType> {
  constructor(repository: Repository<ServiceType>) {
    super(repository);
  }

  async findAllOrdered(): Promise<ServiceType[]> {
    return this.scoped().orderBy("entity.name", "ASC").getMany();
  }

  async findByName(name: string): Promise<ServiceType | null> {
    return this.findOne({ name } as Partial<ServiceType>);
  }
}
