import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity.js";

@Entity("quote_items")
export class QuoteItem extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "bigint", nullable: false, name: "id_cotizacion" })
  quoteId!: string;

  @Column({ type: "bigint", nullable: true, name: "id_item_inventario" })
  inventoryItemId?: string | null;

  @Column({ type: "varchar", length: 255, nullable: false, name: "descripcion" })
  description!: string;

  @Column({ type: "int", nullable: false, name: "cantidad" })
  quantity!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, name: "precio_unitario" })
  unitPrice!: number;
}
