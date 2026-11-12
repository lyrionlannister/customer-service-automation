import "reflect-metadata";
import { IsIn } from "class-validator";
import type { AttributionBasis } from "../entities/revenue-attribution-setting.entity.js";

const BASES: AttributionBasis[] = ["total_value", "margin", "labor_only"];

export class SetAttributionBasisDto {
  @IsIn(BASES, { message: "Base de atribución inválida" })
  attributionBasis!: AttributionBasis;
}
