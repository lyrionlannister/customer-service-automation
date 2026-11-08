import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity.js";
import { Supplier } from "../../suppliers/entities/supplier.entity.js";

@Entity("price_list_items")
export class PriceListItem extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "varchar", length: 100, nullable: false, name: "marca" })
  brand!: string;

  @Column({ type: "varchar", length: 255, nullable: false, name: "modelo" })
  model!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, name: "precio" })
  price!: number;

  @Column({ type: "bigint", nullable: false, name: "id_proveedor" })
  supplierId!: string;

  @ManyToOne(() => Supplier, { nullable: false, onDelete: "CASCADE", eager: false })
  @JoinColumn({ name: "id_proveedor" })
  supplier!: Supplier;

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
