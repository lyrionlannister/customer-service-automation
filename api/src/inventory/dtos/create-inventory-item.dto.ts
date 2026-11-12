import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { InventoryItemKind } from "../entities/inventory-item.entity.js";

const KINDS: InventoryItemKind[] = ["accessory", "part"];

export class CreateInventoryItemDto {
  @IsNotEmpty({ message: "localId requerido" })
  @IsString()
  localId!: string;

  @IsNotEmpty({ message: "Nombre requerido" })
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsIn(KINDS, { message: "Tipo inválido" })
  kind!: InventoryItemKind;

  @IsNumber({}, { message: "Precio de costo debe ser numérico" })
  @Min(0)
  costPrice!: number;

  @IsNumber({}, { message: "Precio de venta debe ser numérico" })
  @Min(0)
  salePrice!: number;
}
