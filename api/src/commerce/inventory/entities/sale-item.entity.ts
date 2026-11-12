import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../../core/common/entities/base.entity.js";

@Entity("sale_items")
export class SaleItem extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "bigint", nullable: false, name: "id_venta" })
  saleId!: string;

  @Column({ type: "bigint", nullable: false, name: "id_item_inventario" })
  inventoryItemId!: string;

  @Column({ type: "int", nullable: false, name: "cantidad" })
  quantity!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, name: "precio_unitario" })
  unitPrice!: number;
}
