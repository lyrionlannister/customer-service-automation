import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "excluded_phone" })
export class ExcludedPhone {
  @PrimaryColumn({ type: "varchar", length: 64 })
  phone!: string;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;
}
