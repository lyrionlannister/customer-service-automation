import { Entity, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity.js";

@Entity("tenants")
export class Tenant extends BaseEntity {
  @Column({ type: "varchar", length: 255, nullable: false, name: "nombre" })
  name!: string;

  @CreateDateColumn({ name: "fecha_creacion", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "fecha_actualizacion",
    default: null,
    onUpdate: "CURRENT_TIMESTAMP",
    nullable: true,
  })
  updatedAt!: Date;
}
