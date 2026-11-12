import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import AppDataSource from "../../../../src/core/config/data-source.js";
import { CashSession } from "../../../../src/commerce/cash/entities/cash-session.entity.js";
import { CashSessionDao } from "../../../../src/commerce/cash/daos/cash-session.dao.js";
import { runWithTenant } from "../../../../src/core/tenancy/tenant-context.js";

// Integration test against a real Postgres, same pattern as
// supplier.dao.test.ts/quote.dao.test.ts.
describe("CashSessionDao tenant isolation", () => {
  let dao: CashSessionDao;
  const base = Date.now();
  const tenantA = `${base}1`;
  const tenantB = `${base}2`;

  beforeAll(async () => {
    await AppDataSource.initialize();
    dao = new CashSessionDao(AppDataSource.getRepository(CashSession));
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it("findAllOrdered only returns the current tenant's sessions", async () => {
    await runWithTenant(tenantA, () => dao.create({ localId: "1", openingBalance: 100, status: "open" }));
    await runWithTenant(tenantB, () => dao.create({ localId: "1", openingBalance: 200, status: "open" }));

    const sessionsA = await runWithTenant(tenantA, () => dao.findAllOrdered());
    const sessionsB = await runWithTenant(tenantB, () => dao.findAllOrdered());

    expect(sessionsA.map((s) => Number(s.openingBalance))).toEqual([100]);
    expect(sessionsB.map((s) => Number(s.openingBalance))).toEqual([200]);
  });

  it("findOpenByLocal does not leak another tenant's open session", async () => {
    await runWithTenant(tenantA, () => dao.create({ localId: "42", openingBalance: 50, status: "open" }));

    const fromB = await runWithTenant(tenantB, () => dao.findOpenByLocal("42"));
    expect(fromB).toBeNull();
  });

  it("findById returns null for a row that belongs to another tenant", async () => {
    const created = await runWithTenant(tenantA, () =>
      dao.create({ localId: "1", openingBalance: 10, status: "open" }),
    );

    const fromOtherTenant = await runWithTenant(tenantB, () => dao.findById(created.id));
    expect(fromOtherTenant).toBeNull();
  });
});
