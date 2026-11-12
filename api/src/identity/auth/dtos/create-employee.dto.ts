import { IsEmail, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";
import { PayCycle, UserRole } from "../entities/user.entity.js";

const ROLES: UserRole[] = ["owner", "admin", "employee"];
const PAY_CYCLES: PayCycle[] = ["weekly", "biweekly", "monthly"];

export class CreateEmployeeDto {
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

  @IsOptional()
  @IsIn(ROLES, { message: "Rol inválido" })
  role?: UserRole;

  @IsOptional()
  @IsNumber({}, { message: "Salario debe ser numérico" })
  @Min(0, { message: "Salario no puede ser negativo" })
  salaryAmount?: number;

  @IsOptional()
  @IsIn(PAY_CYCLES, { message: "Ciclo de pago inválido" })
  payCycle?: PayCycle;
}
