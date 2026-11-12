import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import AppDataSource from "../../../../src/core/config/data-source.js";
import { Supplier } from "../../../../src/commerce/suppliers/entities/supplier.entity.js";
import { SupplierDao } from "../../../../src/commerce/suppliers/daos/supplier.dao.js";
import { runWithTenant } from "../../../../src/core/tenancy/tenant-context.js";

// Integration test against a real Postgres (same DB_* env vars the app
// uses). Proves TenantScopedDao's isolation guarantee: tenant A never sees
// tenant B's rows, through every CRUD path a concrete Dao exposes.
describe("SupplierDao tenant isolation", () => {
  let dao: SupplierDao;
  // tenant_id es bigint, no FK real: dos numericos aleatorios bastan.
  const base = Date.now();
  const tenantA = `${base}1`;
  const tenantB = `${base}2`;

  beforeAll(async () => {
    await AppDataSource.initialize();
    dao = new SupplierDao(AppDataSource.getRepository(Supplier));
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it("findAll only returns the current tenant's suppliers", async () => {
    await runWithTenant(tenantA, () => dao.create({ name: "Proveedor A", phone: "111" }));
    await runWithTenant(tenantB, () => dao.create({ name: "Proveedor B", phone: "222" }));

    const suppliersA = await runWithTenant(tenantA, () => dao.findAll());
    const suppliersB = await runWithTenant(tenantB, () => dao.findAll());

    expect(suppliersA.map((s) => s.name)).toEqual(["Proveedor A"]);
    expect(suppliersB.map((s) => s.name)).toEqual(["Proveedor B"]);
  });

  it("findById returns null for a row that belongs to another tenant", async () => {
    const created = await runWithTenant(tenantA, () =>
      dao.create({ name: "Solo A", phone: "333" }),
    );

    const fromOwnTenant = await runWithTenant(tenantA, () => dao.findById(created.id));
    const fromOtherTenant = await runWithTenant(tenantB, () => dao.findById(created.id));

    expect(fromOwnTenant?.id).toBe(created.id);
    expect(fromOtherTenant).toBeNull();
  });

  it("findByName does not leak another tenant's row with the same name", async () => {
    await runWithTenant(tenantA, () => dao.create({ name: "Mismo Nombre", phone: "444" }));

    const fromB = await runWithTenant(tenantB, () => dao.findByName("Mismo Nombre"));
    expect(fromB).toBeNull();
  });

  it("delete cannot remove a row that belongs to another tenant", async () => {
    const created = await runWithTenant(tenantA, () =>
      dao.create({ name: "Protegido", phone: "555" }),
    );

    const deletedByOther = await runWithTenant(tenantB, () => dao.delete(created.id));
    expect(deletedByOther).toBe(false);

    const stillThere = await runWithTenant(tenantA, () => dao.findById(created.id));
    expect(stillThere?.id).toBe(created.id);
  });
});
