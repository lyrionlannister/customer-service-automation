import "reflect-metadata";
import { IsIn } from "class-validator";
import type { QuoteStatus } from "../entities/quote.entity.js";

const STATUSES: QuoteStatus[] = ["pending", "accepted", "rejected"];

export class SetQuoteStatusDto {
  @IsIn(STATUSES, { message: "Estado inválido" })
  status!: QuoteStatus;
}
