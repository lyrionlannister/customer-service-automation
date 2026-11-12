import { Entity, Column, CreateDateColumn } from "typeorm";
import { BaseEntity } from "../../../core/common/entities/base.entity.js";

// Tipos de servicio: configurables por tenant (se siembran defaults al
// crear el tenant, el tenant puede agregar los suyos). Reemplaza los
// booleans fijos que tenia repair_notes (serviceRepair/.../serviceWaterDamage).
@Entity("service_types")
export class ServiceType extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "varchar", length: 100, nullable: false, name: "nombre" })
  name!: string;

  @CreateDateColumn({ name: "fecha_creacion", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;
}
