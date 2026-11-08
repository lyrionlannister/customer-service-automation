import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("usuarios")
export class User {
  @PrimaryGeneratedColumn("uuid", { name: "id_usuario" })
  id!: string;

  @Column({ type: "varchar", length: 100, nullable: false, name: "nombre" })
  firstName!: string;

  @Column({ type: "varchar", length: 100, nullable: false, name: "apellido" })
  lastName!: string;

  @Column({ type: "varchar", length: 255, nullable: false, name: "email" })
  email!: string;

  @Column({ type: "varchar", length: 255, nullable: false, name: "contrasena" })
  password!: string;

  @Column({ type: "boolean", default: true, name: "activo" })
  isActive!: boolean;

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
