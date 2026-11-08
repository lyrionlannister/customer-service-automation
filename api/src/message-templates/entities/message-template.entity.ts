import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("message_templates")
export class MessageTemplate {
  @PrimaryGeneratedColumn("uuid", { name: "id_plantilla" })
  id!: string;

  @Column({ type: "varchar", length: 100, unique: true, name: "clave" })
  key!: string;

  @Column({ type: "text", nullable: false, name: "texto" })
  text!: string;

  @Column({ type: "varchar", length: 255, nullable: true, name: "descripcion" })
  description?: string;

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
