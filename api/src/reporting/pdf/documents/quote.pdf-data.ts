import { Quote } from "../../../commerce/quotes/entities/quote.entity.js";
import { QuoteItem } from "../../../commerce/quotes/entities/quote-item.entity.js";
import { Local } from "../../../app_platform/local/entities/local.entity.js";

export interface QuotePdfData {
  id: string;
  customerName: string;
  contactNumber: string | null;
  totalValue: number;
  validUntil: string | null;
  status: string;
  createdAt: string;
  items: Array<{ description: string; quantity: number; unitPrice: number }>;
  local: {
    name: string | null;
    address: string | null;
    phone: string | null;
    logo: string | null;
  };
}

export function toQuotePdfData(quote: Quote, items: QuoteItem[], local: Local | null): QuotePdfData {
  return {
    id: quote.id,
    customerName: quote.customerName,
    contactNumber: quote.contactNumber ?? null,
    totalValue: Number(quote.totalValue),
    validUntil: quote.validUntil ?? null,
    status: quote.status,
    createdAt: quote.createdAt.toISOString().slice(0, 10),
    items: items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })),
    local: {
      name: local?.name ?? null,
      address: local?.address ?? null,
      phone: local?.phone ?? null,
      logo: local?.logo ?? null,
    },
  };
}
