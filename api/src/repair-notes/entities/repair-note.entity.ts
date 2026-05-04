import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("repair_notes")
export class RepairNote {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "int" })
  controlNumber!: number;

  @Column({ type: "varchar", length: 255 })
  customerName!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  contactNumber?: string;

  @Column({ type: "varchar", length: 255 })
  brand!: string;

  @Column({ type: "varchar", length: 255 })
  model!: string;

  @Column({ type: "text" })
  reportedFailure!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  totalValue!: number;

  @Column({ type: "varchar", length: 50, default: "received" })
  status!: string;

  @Column({ type: "boolean", default: false })
  requiresAdvance!: boolean;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  advanceValue?: number;

  @Column({ type: "date" })
  receivedAt!: string;

  @Column({ type: "date", nullable: true })
  deliveryDate?: string;

  @Column({ type: "text", nullable: true })
  technicianNotes?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  technicianName?: string;

  // Tipo de Servicio
  @Column({ type: "boolean", default: false })
  serviceRepair!: boolean;

  @Column({ type: "boolean", default: false })
  serviceMaintenance!: boolean;

  @Column({ type: "boolean", default: false })
  serviceDiagnostic!: boolean;

  @Column({ type: "boolean", default: false })
  serviceRevision!: boolean;

  @Column({ type: "boolean", default: false })
  serviceWaterDamage!: boolean;

  // Condición del equipo
  @Column({ type: "boolean", default: false })
  deviceOff!: boolean;

  // Garantía
  @Column({ type: "boolean", default: false })
  hasWarranty!: boolean;

  @Column({ type: "boolean", default: false })
  hasExtendedWarranty!: boolean;

  @Column({ type: "int", nullable: true })
  extendedWarrantyDays?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
