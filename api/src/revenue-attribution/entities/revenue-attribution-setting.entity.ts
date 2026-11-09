import { Entity, Column, UpdateDateColumn } from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity.js";

export type AttributionBasis = "total_value" | "margin" | "labor_only";

// Una fila por tenant (igual que Local): configura como se calcula el
// ingreso atribuido a un empleado en el dashboard de rendimiento.
//   total_value: todo lo cobrado en la nota/venta.
//   margin: cobrado menos el costo de los items usados (InventoryItem.costPrice).
//   labor_only: cobrado menos lo que se cobro por los items en si (deja solo
//     el excedente por mano de obra; en una venta de accesorios pura esto da 0).
@Entity("revenue_attribution_settings")
export class RevenueAttributionSetting extends BaseEntity {
  @Column({ type: "bigint", nullable: false, unique: true, name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "varchar", length: 20, default: "total_value", name: "base_atribucion" })
  attributionBasis!: AttributionBasis;

  @UpdateDateColumn({
    name: "fecha_actualizacion",
    default: null,
    onUpdate: "CURRENT_TIMESTAMP",
    nullable: true,
  })
  updatedAt!: Date;
}
