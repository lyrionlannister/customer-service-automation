import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity("contact_names")
export class ContactName {
  @PrimaryColumn({ type: "varchar", length: 50 })
  phone!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
