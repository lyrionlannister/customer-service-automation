import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity.js";

@Entity("message_templates")
@Unique(["tenantId", "key"])
export class MessageTemplate extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "varchar", length: 100, name: "clave" })
  key!: string;

  @Column({ type: "text", nullable: false, name: "texto" })
  text!: string;

  @Column({ type: "varchar", length: 255, nullable: true, name: "descripcion" })
  description?: string;

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
