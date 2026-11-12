import { CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity("excluded_phone")
export class ExcludedPhone {
  // PK compuesta: dos tenants pueden excluir el mismo numero de forma
  // independiente.
  @PrimaryColumn({ type: "bigint", name: "tenant_id" })
  tenantId!: string;

  @PrimaryColumn({ type: "varchar", length: 64, name: "telefono" })
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
