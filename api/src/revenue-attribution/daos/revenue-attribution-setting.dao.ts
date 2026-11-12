import { Repository } from "typeorm";
import { RevenueAttributionSetting } from "../entities/revenue-attribution-setting.entity.js";
import { TenantScopedDao } from "../../daos/tenant-scoped.dao.js";

export class RevenueAttributionSettingDao extends TenantScopedDao<RevenueAttributionSetting> {
  constructor(repository: Repository<RevenueAttributionSetting>) {
    super(repository);
  }

  async findOrCreate(): Promise<RevenueAttributionSetting> {
    const tenantId = this.currentTenantId();
    const existing = await this.repository.findOneBy({ tenantId } as any);
    if (existing) return existing;

    const created = this.repository.create({ tenantId, attributionBasis: "total_value" } as Partial<RevenueAttributionSetting>);
    return this.repository.save(created);
  }
}
