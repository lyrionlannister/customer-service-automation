import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity("whatsapp_settings")
export class WhatsappSettings {
  @PrimaryColumn({ type: "int", name: "id_configuracion" })
  id!: number;

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
