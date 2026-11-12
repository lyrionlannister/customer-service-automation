import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity.js";

@Entity("repair_notes")
@Unique(["tenantId", "controlNumber"])
export class RepairNote extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "bigint", nullable: true, name: "local_id" })
  localId?: string | null;

  @Column({ type: "bigint", nullable: true, name: "customer_id" })
  customerId?: string | null;

  @Column({ type: "int", name: "numero_control" })
  controlNumber!: number;

  @Column({ type: "varchar", length: 255, nullable: false, name: "nombre_cliente" })
  customerName!: string;

  @Column({ type: "varchar", length: 50, nullable: true, name: "numero_contacto" })
  contactNumber?: string;

  @Column({ type: "varchar", length: 255, nullable: false, name: "marca" })
  brand!: string;

  @Column({ type: "varchar", length: 255, nullable: false, name: "modelo" })
  model!: string;

  @Column({ type: "text", nullable: false, name: "falla_reportada" })
  reportedFailure!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0, name: "valor_total" })
  totalValue!: number;

  @Column({ type: "varchar", length: 50, default: "received", name: "estado" })
  status!: string;

  @Column({ type: "boolean", default: false, name: "requiere_anticipo" })
  requiresAdvance!: boolean;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true, name: "valor_anticipo" })
  advanceValue?: number;

  @Column({ type: "date", name: "fecha_recepcion" })
  receivedAt!: string;

  @Column({ type: "date", nullable: true, name: "fecha_entrega" })
  deliveryDate?: string;

  @Column({ type: "text", nullable: true, name: "notas_tecnico" })
  technicianNotes?: string;

  @Column({ type: "text", nullable: true, name: "hallazgos_adicionales" })
  additionalFindings?: string;

  @Column({ type: "bigint", nullable: true, name: "id_empleado_asignado" })
  assignedEmployeeId?: string | null;

  @Column({ type: "boolean", default: false, name: "dispositivo_apagado" })
  deviceOff!: boolean;

  @Column({ type: "boolean", default: false, name: "tiene_garantia" })
  hasWarranty!: boolean;

  @Column({ type: "boolean", default: false, name: "tiene_garantia_extendida" })
  hasExtendedWarranty!: boolean;

  @Column({ type: "int", nullable: true, name: "dias_garantia_extendida" })
  extendedWarrantyDays?: number;

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
