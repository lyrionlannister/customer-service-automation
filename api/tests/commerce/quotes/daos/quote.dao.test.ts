import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import AppDataSource from "../../../../src/core/config/data-source.js";
import { Quote } from "../../../../src/commerce/quotes/entities/quote.entity.js";
import { QuoteDao } from "../../../../src/commerce/quotes/daos/quote.dao.js";
import { runWithTenant } from "../../../../src/core/tenancy/tenant-context.js";

// Integration test against a real Postgres. Proves TenantScopedDao's
// isolation guarantee for the quotes module, same pattern as
// supplier.dao.test.ts.
describe("QuoteDao tenant isolation", () => {
  let dao: QuoteDao;
  const base = Date.now();
  const tenantA = `${base}1`;
  const tenantB = `${base}2`;

  beforeAll(async () => {
    await AppDataSource.initialize();
    dao = new QuoteDao(AppDataSource.getRepository(Quote));
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it("findAllOrdered only returns the current tenant's quotes", async () => {
    await runWithTenant(tenantA, () =>
      dao.create({ localId: "1", customerName: "Cliente A", status: "pending", totalValue: 0 }),
    );
    await runWithTenant(tenantB, () =>
      dao.create({ localId: "1", customerName: "Cliente B", status: "pending", totalValue: 0 }),
    );

    const quotesA = await runWithTenant(tenantA, () => dao.findAllOrdered());
    const quotesB = await runWithTenant(tenantB, () => dao.findAllOrdered());

    expect(quotesA.map((q) => q.customerName)).toEqual(["Cliente A"]);
    expect(quotesB.map((q) => q.customerName)).toEqual(["Cliente B"]);
  });

  it("findById returns null for a row that belongs to another tenant", async () => {
    const created = await runWithTenant(tenantA, () =>
      dao.create({ localId: "1", customerName: "Solo A", status: "pending", totalValue: 0 }),
    );

    const fromOwnTenant = await runWithTenant(tenantA, () => dao.findById(created.id));
    const fromOtherTenant = await runWithTenant(tenantB, () => dao.findById(created.id));

    expect(fromOwnTenant?.id).toBe(created.id);
    expect(fromOtherTenant).toBeNull();
  });

  it("delete cannot remove a row that belongs to another tenant", async () => {
    const created = await runWithTenant(tenantA, () =>
      dao.create({ localId: "1", customerName: "Protegido", status: "pending", totalValue: 0 }),
    );

    const deletedByOther = await runWithTenant(tenantB, () => dao.delete(created.id));
    expect(deletedByOther).toBe(false);

    const stillThere = await runWithTenant(tenantA, () => dao.findById(created.id));
    expect(stillThere?.id).toBe(created.id);
  });
});
