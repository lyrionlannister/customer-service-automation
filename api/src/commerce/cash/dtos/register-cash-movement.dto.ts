import "reflect-metadata";
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import type { CashMovementMethod, CashMovementRelatedEntityType, CashMovementType } from "../entities/cash-movement.entity.js";

const TYPES: CashMovementType[] = ["income", "expense"];
const METHODS: CashMovementMethod[] = ["efectivo", "tarjeta", "transferencia"];
const RELATED_ENTITY_TYPES: CashMovementRelatedEntityType[] = ["repair_note", "quote", "sale", "manual"];

export class RegisterCashMovementDto {
  @IsIn(TYPES, { message: "Tipo inválido" })
  type!: CashMovementType;

  @IsIn(METHODS, { message: "Método de pago inválido" })
  method!: CashMovementMethod;

  @IsNumber({}, { message: "Monto debe ser numérico" })
  @Min(0.01, { message: "Monto debe ser mayor a 0" })
  amount!: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNotEmpty({ message: "createdByEmployeeId requerido" })
  @IsString()
  createdByEmployeeId!: string;

  @IsOptional()
  @IsIn(RELATED_ENTITY_TYPES, { message: "relatedEntityType inválido" })
  relatedEntityType?: CashMovementRelatedEntityType;

  @IsOptional()
  @IsString()
  relatedEntityId?: string;
}
