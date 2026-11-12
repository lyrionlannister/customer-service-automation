import "reflect-metadata";
import { Type } from "class-transformer";
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { StagingRowDto } from "./staging-row.dto.js";

export class ImportStagingCallbackDto {
  @IsNotEmpty({ message: "tenantId requerido" })
  @IsString()
  tenantId!: string;

  @IsNotEmpty({ message: "importId requerido" })
  @IsString()
  importId!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StagingRowDto)
  rows?: StagingRowDto[];

  @IsOptional()
  @IsString()
  error?: string;
}
