import "reflect-metadata";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateServiceTypeDto {
  @IsString()
  @IsNotEmpty({ message: "El nombre del tipo de servicio es obligatorio" })
  @MaxLength(100)
  name!: string;
}
