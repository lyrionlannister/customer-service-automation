import "reflect-metadata";
import { IsNumber, Min } from "class-validator";

export class CloseCashSessionDto {
  @IsNumber({}, { message: "Saldo de cierre debe ser numérico" })
  @Min(0)
  closingBalance!: number;
}
