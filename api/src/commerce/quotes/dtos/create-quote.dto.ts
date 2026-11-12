import "reflect-metadata";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { QuoteItemInputDto } from "./quote-item-input.dto.js";

export class CreateQuoteDto {
  @IsNotEmpty({ message: "localId requerido" })
  @IsString()
  localId!: string;

  @IsNotEmpty({ message: "Nombre del cliente requerido" })
  @IsString()
  customerName!: string;

  @IsOptional()
  @IsString()
  contactNumber?: string;

  @IsOptional()
  @IsString()
  validUntil?: string;

  @IsOptional()
  @IsString()
  createdByEmployeeId?: string;

  @IsArray()
  @ArrayMinSize(1, { message: "La cotización debe tener al menos un item" })
  @ValidateNested({ each: true })
  @Type(() => QuoteItemInputDto)
  items!: QuoteItemInputDto[];
}
