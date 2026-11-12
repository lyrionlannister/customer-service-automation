import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../../core/common/entities/base.entity.js";

@Entity("repair_note_service_types")
export class RepairNoteServiceType extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "bigint", nullable: false, name: "id_nota_reparacion" })
  repairNoteId!: string;

  @Column({ type: "bigint", nullable: false, name: "id_tipo_servicio" })
  serviceTypeId!: string;
}
