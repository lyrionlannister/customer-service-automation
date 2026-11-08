import { IsIn, IsInt, IsOptional, IsString, NotEquals } from "class-validator";
import { MovementType } from "../entities/inventory-movement.entity.js";

const TYPES: MovementType[] = ["in", "out", "adjustment"];

export class RegisterMovementDto {
  @IsIn(TYPES, { message: "Tipo de movimiento inválido" })
  type!: MovementType;

  @IsInt({ message: "Cantidad debe ser un entero" })
  @NotEquals(0, { message: "Cantidad no puede ser cero" })
  quantity!: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  createdByEmployeeId?: string;
}
