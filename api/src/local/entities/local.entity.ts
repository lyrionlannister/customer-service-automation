import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity.js";

@Entity("local_config")
export class Local extends BaseEntity {
  @Column({ type: "bigint", nullable: false, unique: true, name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "varchar", length: 255, nullable: true, name: "nombre" })
  name?: string;

  @Column({ type: "varchar", length: 500, nullable: true, name: "direccion" })
  address?: string;

  @Column({ type: "varchar", length: 50, nullable: true, name: "telefono" })
  phone?: string;

  @Column({ type: "text", nullable: true, name: "logo" })
  logo?: string;

  @Column({ type: "int", default: 1, name: "siguiente_numero_control" })
  nextControlNumber!: number;

  // 0 = sin redondeo. Solo se aplica a movimientos de caja en efectivo
  // (CashService.registerMovement) -- tarjeta/transferencia nunca redondean.
  @Column({ type: "decimal", precision: 4, scale: 2, default: 0, name: "unidad_redondeo_caja" })
  cashRoundingUnit!: number;

  @CreateDateColumn({
    name: "fecha_creacion",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "fecha_actualizacion",
    default: null,
    onUpdate: "CURRENT_TIMESTAMP",
    nullable: true,
  })
  updatedAt!: Date;
}
