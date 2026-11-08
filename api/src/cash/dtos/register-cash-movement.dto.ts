import "reflect-metadata";
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import type { CashMovementMethod, CashMovementType } from "../entities/cash-movement.entity.js";

const TYPES: CashMovementType[] = ["income", "expense"];
const METHODS: CashMovementMethod[] = ["efectivo", "tarjeta", "transferencia"];

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
}
