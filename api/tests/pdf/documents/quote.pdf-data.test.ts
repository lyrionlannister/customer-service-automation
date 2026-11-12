import { describe, expect, it } from "vitest";
import { toQuotePdfData } from "../../../src/pdf/documents/quote.pdf-data.js";
import type { Quote } from "../../../src/quotes/entities/quote.entity.js";
import type { QuoteItem } from "../../../src/quotes/entities/quote-item.entity.js";
import type { Local } from "../../../src/local/entities/local.entity.js";

function makeQuote(overrides: Partial<Quote> = {}): Quote {
  return {
    id: "1",
    customerName: "Juan Pérez",
    contactNumber: "555",
    totalValue: "600.00",
    validUntil: "2026-02-01",
    status: "pending",
    createdAt: new Date("2026-01-10T00:00:00.000Z"),
    ...overrides,
  } as unknown as Quote;
}

function makeItem(overrides: Partial<QuoteItem> = {}): QuoteItem {
  return { description: "Pantalla", quantity: 1, unitPrice: "500.00", ...overrides } as unknown as QuoteItem;
}

describe("toQuotePdfData", () => {
  it("convierte decimales (string) a number para la cotización y sus items", () => {
    const data = toQuotePdfData(makeQuote(), [makeItem()], null);

    expect(data.totalValue).toBe(600);
    expect(data.items).toEqual([{ description: "Pantalla", quantity: 1, unitPrice: 500 }]);
  });

  it("usa null para contactNumber/validUntil ausentes", () => {
    const data = toQuotePdfData(makeQuote({ contactNumber: undefined, validUntil: undefined }), [], null);

    expect(data.contactNumber).toBeNull();
    expect(data.validUntil).toBeNull();
  });

  it("mapea los datos del local cuando existe", () => {
    const local = { name: "Mi Taller", address: null, phone: "555", logo: null } as Local;
    const data = toQuotePdfData(makeQuote(), [], local);

    expect(data.local.name).toBe("Mi Taller");
  });
});
