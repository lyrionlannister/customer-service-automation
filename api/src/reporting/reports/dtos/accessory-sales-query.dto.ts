import "reflect-metadata";
import { IsIn, IsOptional } from "class-validator";
import { ReportPeriodQueryDto } from "./report-period-query.dto.js";

export type AccessorySalesGroupBy = "item" | "day" | "week";
const GROUP_BY_VALUES: AccessorySalesGroupBy[] = ["item", "day", "week"];

export class AccessorySalesQueryDto extends ReportPeriodQueryDto {
  @IsOptional()
  @IsIn(GROUP_BY_VALUES, { message: "groupBy inválido, usa item|day|week" })
  groupBy?: AccessorySalesGroupBy;
}
