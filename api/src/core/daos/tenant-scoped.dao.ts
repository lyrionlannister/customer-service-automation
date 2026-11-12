import { ObjectLiteral, Repository, SelectQueryBuilder } from "typeorm";
import { BaseDao } from "./base.dao.js";
import { getCurrentTenantId } from "../tenancy/tenant-context.js";

type TenantOwned = { tenantId: string };

// Unico lugar donde un repository concreto construye una query sobre un
// modelo con tenant: todo metodo propio de un Dao hijo debe partir de
// `this.scoped()`, nunca de `this.repository.find()`/`createQueryBuilder()`
// directo, asi el filtro de tenant no depende de que cada autor se acuerde
// de ponerlo. Los metodos heredados de BaseDao ya quedan cubiertos aqui.
export abstract class TenantScopedDao<
  T extends ObjectLiteral & TenantOwned,
> extends BaseDao<T> {
  constructor(repository: Repository<T>) {
    super(repository);
  }

  protected scoped(alias = "entity"): SelectQueryBuilder<T> {
    const tenantId = getCurrentTenantId();
    return this.repository
      .createQueryBuilder(alias)
      .where(`${alias}.tenantId = :tenantId`, { tenantId });
  }

  protected currentTenantId(): string {
    return getCurrentTenantId();
  }

  override async create(data: Partial<T>): Promise<T> {
    const tenantId = getCurrentTenantId();
    return super.create({ ...data, tenantId } as Partial<T>);
  }

  override async findById(id: string | number): Promise<T | null> {
    const tenantId = getCurrentTenantId();
    const entity = await super.findById(id);
    if (!entity || entity.tenantId !== tenantId) return null;
    return entity;
  }

  override async findOne(where: Partial<T>): Promise<T | null> {
    const tenantId = getCurrentTenantId();
    return super.findOne({ ...where, tenantId } as Partial<T>);
  }

  override async findAll(): Promise<T[]> {
    const tenantId = getCurrentTenantId();
    return this.repository.find({ where: { tenantId } as any });
  }

  override async update(id: string | number, data: Partial<T>): Promise<T | null> {
    const tenantId = getCurrentTenantId();
    const existing = await super.findById(id);
    if (!existing || existing.tenantId !== tenantId) return null;
    return super.update(id, data);
  }

  override async delete(id: string | number): Promise<boolean> {
    const tenantId = getCurrentTenantId();
    const existing = await super.findById(id);
    if (!existing || existing.tenantId !== tenantId) return false;
    return super.delete(id);
  }
}
