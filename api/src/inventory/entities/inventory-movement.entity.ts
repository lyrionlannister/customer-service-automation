import { Entity, Column, CreateDateColumn } from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity.js";

export type MovementType = "in" | "out" | "adjustment";
export type RelatedEntityType = "sale" | "repair_note" | "manual";

@Entity("inventory_movements")
export class InventoryMovement extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "bigint", nullable: false, name: "id_item_inventario" })
  inventoryItemId!: string;

  @Column({ type: "varchar", length: 20, nullable: false, name: "tipo" })
  type!: MovementType;

  // Delta real aplicado a quantityOnHand: "in"/"out" siempre llegan aqui ya
  // normalizados a +/-, "adjustment" puede ser cualquier signo.
  @Column({ type: "int", nullable: false, name: "cantidad" })
  quantity!: number;

  @Column({ type: "varchar", length: 255, nullable: true, name: "motivo" })
  reason!: string | null;

  @Column({ type: "varchar", length: 20, default: "manual", name: "tipo_entidad_relacionada" })
  relatedEntityType!: RelatedEntityType;

  @Column({ type: "bigint", nullable: true, name: "id_entidad_relacionada" })
  relatedEntityId!: string | null;

  @Column({ type: "bigint", nullable: true, name: "id_empleado_creador" })
  createdByEmployeeId!: string | null;

  @CreateDateColumn({ name: "fecha_creacion", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;
}
