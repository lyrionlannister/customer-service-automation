import { Entity, Column, CreateDateColumn } from "typeorm";
import { BaseEntity } from "../../../core/common/entities/base.entity.js";

export type CashSessionStatus = "open" | "closed";

@Entity("cash_sessions")
export class CashSession extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "bigint", nullable: false, name: "local_id" })
  localId!: string;

  @Column({ type: "bigint", nullable: true, name: "id_empleado_apertura" })
  openedByEmployeeId?: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2, name: "saldo_apertura" })
  openingBalance!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true, name: "saldo_cierre" })
  closingBalance?: number | null;

  @Column({ type: "varchar", length: 10, default: "open", name: "estado" })
  status!: CashSessionStatus;

  @CreateDateColumn({ name: "fecha_apertura", default: () => "CURRENT_TIMESTAMP" })
  openedAt!: Date;

  @Column({ type: "timestamp", nullable: true, name: "fecha_cierre" })
  closedAt?: Date | null;
}
