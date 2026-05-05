import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("local_config")
export class Local {
  @PrimaryGeneratedColumn("uuid", { name: "id_local" })
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: true, name: "nombre" })
  name?: string;

  @Column({ type: "varchar", length: 500, nullable: true, name: "direccion" })
  address?: string;

  @Column({ type: "varchar", length: 50, nullable: true, name: "telefono" })
  phone?: string;

  @Column({ type: "text", nullable: true, name: "logo" })
  logo?: string;

  @Column({ type: "int", default: 1, name: "siguiente_numero_control" })
  nextControlNumber!: number;

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
