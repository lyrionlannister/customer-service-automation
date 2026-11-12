import "reflect-metadata";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class StagingRowDto {
  @IsNotEmpty({ message: "brand requerido" })
  @IsString()
  brand!: string;

  @IsNotEmpty({ message: "model requerido" })
  @IsString()
  model!: string;

  @IsNumber({}, { message: "price debe ser numérico" })
  @Min(0)
  price!: number;
}
