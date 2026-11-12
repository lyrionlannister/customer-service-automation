import "reflect-metadata";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class OpenCashSessionDto {
  @IsNotEmpty({ message: "localId requerido" })
  @IsString()
  localId!: string;

  @IsNumber({}, { message: "Saldo de apertura debe ser numérico" })
  @Min(0)
  openingBalance!: number;

  @IsOptional()
  @IsString()
  openedByEmployeeId?: string;
}
