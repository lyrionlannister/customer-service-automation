import "reflect-metadata";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, ValidateNested } from "class-validator";
import { StagingRowDto } from "./staging-row.dto.js";

export class UpdateStagingRowsDto {
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => StagingRowDto)
  rows!: StagingRowDto[];
}
