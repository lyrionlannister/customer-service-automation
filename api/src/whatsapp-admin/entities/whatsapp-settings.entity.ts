import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "whatsapp_settings" })
export class WhatsappSettings {
  @PrimaryColumn({ type: "int" })
  id!: number;

  @Column({ type: "boolean", default: true })
  aiRepliesEnabled!: boolean;
}
