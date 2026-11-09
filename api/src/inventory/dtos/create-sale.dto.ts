import "reflect-metadata";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { PaymentMethod } from "../entities/sale.entity.js";

const PAYMENT_METHODS: PaymentMethod[] = ["efectivo", "tarjeta", "transferencia"];

export class SaleItemInputDto {
  @IsNotEmpty({ message: "inventoryItemId requerido" })
  @IsString()
  inventoryItemId!: string;

  @IsNumber({}, { message: "Cantidad debe ser numérica" })
  @Min(1, { message: "Cantidad debe ser al menos 1" })
  quantity!: number;

  @IsNumber({}, { message: "Precio unitario debe ser numérico" })
  @Min(0)
  unitPrice!: number;
}

export class CreateSaleDto {
  @IsNotEmpty({ message: "localId requerido" })
  @IsString()
  localId!: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsIn(PAYMENT_METHODS, { message: "Método de pago inválido" })
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  createdByEmployeeId?: string;

  @IsArray()
  @ArrayMinSize(1, { message: "La venta debe tener al menos un item" })
  @ValidateNested({ each: true })
  @Type(() => SaleItemInputDto)
  items!: SaleItemInputDto[];
}
