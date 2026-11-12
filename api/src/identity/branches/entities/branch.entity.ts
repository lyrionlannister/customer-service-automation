import { Entity, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseEntity } from "../../../core/common/entities/base.entity.js";

@Entity("branches")
export class Branch extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "varchar", length: 255, nullable: false, name: "nombre" })
  name!: string;

  @Column({ type: "varchar", length: 500, nullable: true, name: "direccion" })
  address?: string;

  @Column({ type: "varchar", length: 50, nullable: true, name: "telefono" })
  phone?: string;

  @Column({ type: "boolean", default: true, name: "activa" })
  isActive!: boolean;

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
