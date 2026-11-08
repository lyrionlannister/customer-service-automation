import { Column, Generated, PrimaryGeneratedColumn } from "typeorm";

// `id` es la PK interna (bigint autoincremental), la que deben usar FKs y
// joins -- comparar bigint es mas rapido que comparar uuid. `publicId` es el
// unico identificador que debe salir hacia la API/URL/logs: no permite
// enumerar registros ni revela volumen de negocio (igual que en `template`).
export abstract class BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id!: string;

  @Column({ type: "uuid", name: "public_id", unique: true })
  @Generated("uuid")
  publicId!: string;
}
