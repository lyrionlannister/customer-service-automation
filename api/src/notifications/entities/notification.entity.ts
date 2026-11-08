import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

export type NotificationType = "conversation_transferred" | "new_human_message";

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn({ name: "id_notificacion" })
  id!: number;

  @Column({ type: "varchar", length: 50, name: "tipo" })
  type!: NotificationType;

  @Column({ type: "varchar", length: 100, name: "session_id" })
  sessionId!: string;

  @Column({ type: "varchar", length: 100, name: "telefono" })
  phone!: string;

  @Column({ type: "varchar", length: 255, nullable: true, name: "nombre_contacto" })
  contactName?: string;

  @Column({ type: "boolean", default: false, name: "leida" })
  read!: boolean;

  @CreateDateColumn({
    name: "fecha_creacion",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;
}
