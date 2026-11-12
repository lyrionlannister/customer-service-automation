import { RevenueAttributionSettingDao } from "../daos/revenue-attribution-setting.dao.js";
import { AttributionBasis, RevenueAttributionSetting } from "../entities/revenue-attribution-setting.entity.js";

export class RevenueAttributionService {
  constructor(private dao: RevenueAttributionSettingDao) {}

  async getSetting(): Promise<RevenueAttributionSetting> {
    return this.dao.findOrCreate();
  }

  async setBasis(basis: AttributionBasis): Promise<RevenueAttributionSetting> {
    const setting = await this.dao.findOrCreate();
    return (await this.dao.update(setting.id, { attributionBasis: basis })) as RevenueAttributionSetting;
  }
}

// Formula compartida por los reportes: nunca se hardcodea en un service de
// reporte individual, para que "ingreso atribuido" signifique lo mismo en
// empleados, accesorios y notas por tipo.
export function attributedAmount(
  totalValue: number,
  itemsCost: number,
  itemsSalePrice: number,
  basis: AttributionBasis,
): number {
  switch (basis) {
    case "margin":
      return totalValue - itemsCost;
    case "labor_only":
      return totalValue - itemsSalePrice;
    default:
      return totalValue;
  }
}
