import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from "typeorm";

@Entity("local_config")
export class Local {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  name?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  address?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone?: string;

  @Column({ type: "text", nullable: true })
  logo?: string;

  @Column({ type: "int", default: 1 })
  nextControlNumber!: number;

  @UpdateDateColumn()
  updatedAt!: Date;
}
