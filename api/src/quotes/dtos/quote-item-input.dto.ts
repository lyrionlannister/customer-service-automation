import "reflect-metadata";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class QuoteItemInputDto {
  @IsOptional()
  @IsString()
  inventoryItemId?: string;

  @IsNotEmpty({ message: "Descripción requerida" })
  @IsString()
  description!: string;

  @IsNumber({}, { message: "Cantidad debe ser numérica" })
  @Min(1, { message: "Cantidad debe ser al menos 1" })
  quantity!: number;

  @IsNumber({}, { message: "Precio unitario debe ser numérico" })
  @Min(0)
  unitPrice!: number;
}
