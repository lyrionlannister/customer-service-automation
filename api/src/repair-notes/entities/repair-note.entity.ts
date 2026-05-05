import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("repair_notes")
export class RepairNote {
  @PrimaryGeneratedColumn("uuid", { name: "id_nota_reparacion" })
  id!: string;

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

  @Column({ type: "varchar", length: 255, nullable: true, name: "nombre_tecnico" })
  technicianName?: string;

  @Column({ type: "boolean", default: false, name: "servicio_reparacion" })
  serviceRepair!: boolean;

  @Column({ type: "boolean", default: false, name: "servicio_mantenimiento" })
  serviceMaintenance!: boolean;

  @Column({ type: "boolean", default: false, name: "servicio_diagnostico" })
  serviceDiagnostic!: boolean;

  @Column({ type: "boolean", default: false, name: "servicio_revision" })
  serviceRevision!: boolean;

  @Column({ type: "boolean", default: false, name: "servicio_dano_agua" })
  serviceWaterDamage!: boolean;

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
