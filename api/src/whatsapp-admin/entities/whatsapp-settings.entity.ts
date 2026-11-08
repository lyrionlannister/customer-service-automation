import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity("whatsapp_settings")
export class WhatsappSettings {
  // Una fila por tenant: el tenant ES la llave, no un id autoincremental
  // global con un unico registro id=1 como antes.
  @PrimaryColumn({ type: "bigint", name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "boolean", default: true, name: "respuestas_ia_habilitadas" })
  aiRepliesEnabled!: boolean;

  @Column({ type: "text", nullable: true, name: "url_automatizacion" })
  automationUrl!: string | null;

  @Column({ type: "text", nullable: true, name: "url_editor_n8n" })
  n8nEditorUrl!: string | null;

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
