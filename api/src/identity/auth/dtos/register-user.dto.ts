import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterUserDto {
  @IsNotEmpty({ message: "Nombre requerido" })
  @IsString({ message: "Nombre debe ser texto" })
  firstName!: string;

  @IsNotEmpty({ message: "Apellido requerido" })
  @IsString({ message: "Apellido debe ser texto" })
  lastName!: string;

  @IsNotEmpty({ message: "Email requerido" })
  @IsEmail({}, { message: "Email inválido" })
  email!: string;

  @IsNotEmpty({ message: "Password requerido" })
  @IsString()
  @MinLength(8, { message: "Password debe tener al menos 8 caracteres" })
  password!: string;
}
