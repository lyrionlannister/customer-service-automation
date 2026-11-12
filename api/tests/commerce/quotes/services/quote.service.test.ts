import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import AppDataSource from "../../../../src/core/config/data-source.js";
import { Quote } from "../../../../src/commerce/quotes/entities/quote.entity.js";
import { QuoteItem } from "../../../../src/commerce/quotes/entities/quote-item.entity.js";
import { QuoteDao } from "../../../../src/commerce/quotes/daos/quote.dao.js";
import { QuoteItemDao } from "../../../../src/commerce/quotes/daos/quote-item.dao.js";
import { QuoteService } from "../../../../src/commerce/quotes/services/quote.service.js";
import { runWithTenant } from "../../../../src/core/tenancy/tenant-context.js";

// Integration test against a real Postgres (same reasoning as
// inventory.service.test.ts/repair-note.service.test.ts): proves the
// transactional create/update + computed totalValue, not just mocked calls.
describe("QuoteService", () => {
  let service: QuoteService;
  const tenantId = `${Date.now()}3`;

  beforeAll(async () => {
    await AppDataSource.initialize();
    const quoteDao = new QuoteDao(AppDataSource.getRepository(Quote));
    const quoteItemDao = new QuoteItemDao(AppDataSource.getRepository(QuoteItem));
    service = new QuoteService(quoteDao, quoteItemDao);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it("rejects creating a quote with no items", async () => {
    await expect(
      runWithTenant(tenantId, () =>
        service.create({ localId: "1", customerName: "Sin items" } as any, []),
      ),
    ).rejects.toThrow("al menos un item");
  });

  it("computes totalValue from the items, ignoring any client-sent value", async () => {
    const quote = await runWithTenant(tenantId, () =>
      service.create({ localId: "1", customerName: "Juan", totalValue: 999 } as any, [
        { description: "Pantalla", quantity: 1, unitPrice: 500 },
        { description: "Mano de obra", quantity: 2, unitPrice: 50 },
      ]),
    );

    expect(Number(quote.totalValue)).toBe(600);
    expect(quote.status).toBe("pending");

    const items = await runWithTenant(tenantId, () => service.getItems(quote.id));
    expect(items).toHaveLength(2);
  });

  it("update replaces items and recalculates totalValue", async () => {
    const quote = await runWithTenant(tenantId, () =>
      service.create({ localId: "1", customerName: "Ana" } as any, [
        { description: "Item inicial", quantity: 1, unitPrice: 100 },
      ]),
    );

    const updated = await runWithTenant(tenantId, () =>
      service.update(quote.id, {}, [{ description: "Item nuevo", quantity: 3, unitPrice: 40 }]),
    );

    expect(Number(updated?.totalValue)).toBe(120);
    const items = await runWithTenant(tenantId, () => service.getItems(quote.id));
    expect(items.map((i) => i.description)).toEqual(["Item nuevo"]);
  });

  it("setStatus transitions a quote without touching its items or total", async () => {
    const quote = await runWithTenant(tenantId, () =>
      service.create({ localId: "1", customerName: "Carlos" } as any, [
        { description: "Item", quantity: 1, unitPrice: 10 },
      ]),
    );

    const accepted = await runWithTenant(tenantId, () => service.setStatus(quote.id, "accepted"));
    expect(accepted?.status).toBe("accepted");
    expect(Number(accepted?.totalValue)).toBe(10);
  });
});
