import { Entity, Column, CreateDateColumn } from "typeorm";
import { BaseEntity } from "../../../core/common/entities/base.entity.js";

export type PaymentMethod = "efectivo" | "tarjeta" | "transferencia";

@Entity("sales")
export class Sale extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "bigint", nullable: false, name: "local_id" })
  localId!: string;

  @Column({ type: "varchar", length: 255, nullable: true, name: "nombre_cliente" })
  customerName!: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2, name: "valor_total" })
  totalValue!: number;

  @Column({ type: "varchar", length: 20, nullable: false, name: "metodo_pago" })
  paymentMethod!: PaymentMethod;

  @Column({ type: "bigint", nullable: true, name: "id_empleado_creador" })
  createdByEmployeeId!: string | null;

  @CreateDateColumn({ name: "fecha_creacion", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;
}
