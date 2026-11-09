import "reflect-metadata";
import { IsOptional, IsString } from "class-validator";
import { ReportPeriodQueryDto } from "./report-period-query.dto.js";

export class EmployeePerformanceQueryDto extends ReportPeriodQueryDto {
  @IsOptional()
  @IsString()
  employeeId?: string;
}
