import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity.js";

export type UserRole = "owner" | "admin" | "employee";
export type PayCycle = "weekly" | "biweekly" | "monthly";

@Entity("usuarios")
export class User extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "varchar", length: 20, default: "owner", name: "rol" })
  role!: UserRole;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true, name: "salario" })
  salaryAmount!: number | null;

  @Column({ type: "varchar", length: 20, nullable: true, name: "ciclo_pago" })
  payCycle!: PayCycle | null;

  @Column({ type: "varchar", length: 100, nullable: false, name: "nombre" })
  firstName!: string;

  @Column({ type: "varchar", length: 100, nullable: false, name: "apellido" })
  lastName!: string;

  @Column({ type: "varchar", length: 255, nullable: false, name: "email" })
  email!: string;

  @Column({ type: "varchar", length: 255, nullable: false, name: "contrasena" })
  password!: string;

  @Column({ type: "boolean", default: true, name: "activo" })
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
