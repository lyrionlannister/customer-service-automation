import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { BaseEntity } from "../../../core/common/entities/base.entity.js";

@Entity("proveedores")
export class Supplier extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "varchar", length: 255, nullable: false, name: "nombre" })
  name!: string;

  @Column({ type: "varchar", length: 20, nullable: false, name: "telefono" })
  phone!: string;

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
