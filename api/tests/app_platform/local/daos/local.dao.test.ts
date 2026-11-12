import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import AppDataSource from "../../../../src/core/config/data-source.js";
import { Local } from "../../../../src/app_platform/local/entities/local.entity.js";
import { LocalDao } from "../../../../src/app_platform/local/daos/local.dao.js";
import { runWithTenant } from "../../../../src/core/tenancy/tenant-context.js";

// Integration test: requires a reachable Postgres (same DB_* env vars the app
// uses). Proves the fix for the control-number race — see
// consumeControlNumber() in local.dao.ts.
describe("LocalDao.consumeControlNumber", () => {
  let dao: LocalDao;
  // Tenant_id es bigint, no FK real: un numerico aleatorio por corrida basta
  // para aislar este test de cualquier dato real y de otras corridas (el
  // local_config de un tenant es un singleton).
  const tenantId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

  beforeAll(async () => {
    await AppDataSource.initialize();
    dao = new LocalDao(AppDataSource.getRepository(Local));
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it("never hands out the same control number twice to concurrent callers", async () => {
    const results = await runWithTenant(tenantId, () =>
      Promise.all([
        dao.consumeControlNumber(),
        dao.consumeControlNumber(),
        dao.consumeControlNumber(),
        dao.consumeControlNumber(),
        dao.consumeControlNumber(),
      ]),
    );

    expect(new Set(results).size).toBe(results.length);
  });
});
