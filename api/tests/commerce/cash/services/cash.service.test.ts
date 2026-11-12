import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import AppDataSource from "../../../../src/core/config/data-source.js";
import { CashSession } from "../../../../src/commerce/cash/entities/cash-session.entity.js";
import { CashMovement } from "../../../../src/commerce/cash/entities/cash-movement.entity.js";
import { CashSessionDao } from "../../../../src/commerce/cash/daos/cash-session.dao.js";
import { CashMovementDao } from "../../../../src/commerce/cash/daos/cash-movement.dao.js";
import { CashService } from "../../../../src/commerce/cash/services/cash.service.js";
import { Local } from "../../../../src/app_platform/local/entities/local.entity.js";
import { LocalDao } from "../../../../src/app_platform/local/daos/local.dao.js";
import { LocalService } from "../../../../src/app_platform/local/services/local.service.js";
import { runWithTenant } from "../../../../src/core/tenancy/tenant-context.js";

// Integration test against a real Postgres (same reasoning as
// quote.service.test.ts): proves the rounding rule end-to-end through
// LocalService.getConfig(), not just a mocked unit.
describe("CashService", () => {
  let service: CashService;
  let localService: LocalService;
  const tenantId = `${Date.now()}4`;

  beforeAll(async () => {
    await AppDataSource.initialize();
    const sessionDao = new CashSessionDao(AppDataSource.getRepository(CashSession));
    const movementDao = new CashMovementDao(AppDataSource.getRepository(CashMovement));
    localService = new LocalService(new LocalDao(AppDataSource.getRepository(Local)));
    service = new CashService(sessionDao, movementDao, localService);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it("rejects opening a second session while one is already open for the local", async () => {
    await runWithTenant(tenantId, () => service.openSession("1", 100));

    await expect(runWithTenant(tenantId, () => service.openSession("1", 50))).rejects.toThrow(
      "Ya hay una sesión de caja abierta",
    );
  });

  it("rejects registering a movement on a closed session", async () => {
    const closedTenant = `${tenantId}1`;
    const session = await runWithTenant(closedTenant, () => service.openSession("1", 0));
    await runWithTenant(closedTenant, () => service.closeSession(session.id, 0));

    await expect(
      runWithTenant(closedTenant, () =>
        service.registerMovement({ cashSessionId: session.id, type: "income", method: "tarjeta", amount: 50 }),
      ),
    ).rejects.toThrow("sesión cerrada");
  });

  it("rounds cash movements per the local's cashRoundingUnit, never card/transfer", async () => {
    const roundingTenant = `${tenantId}2`;
    await runWithTenant(roundingTenant, () => localService.updateConfig({ cashRoundingUnit: 0.5 }));
    const session = await runWithTenant(roundingTenant, () => service.openSession("1", 0));

    const cash = await runWithTenant(roundingTenant, () =>
      service.registerMovement({ cashSessionId: session.id, type: "income", method: "efectivo", amount: 123.3 }),
    );
    const card = await runWithTenant(roundingTenant, () =>
      service.registerMovement({ cashSessionId: session.id, type: "income", method: "tarjeta", amount: 123.3 }),
    );

    expect(Number(cash.amount)).toBe(123.5);
    expect(Number(card.amount)).toBe(123.3);
  });

  it("leaves amounts untouched when the local has no rounding configured", async () => {
    const noRoundTenant = `${tenantId}3`;
    const session = await runWithTenant(noRoundTenant, () => service.openSession("1", 0));

    const cash = await runWithTenant(noRoundTenant, () =>
      service.registerMovement({ cashSessionId: session.id, type: "income", method: "efectivo", amount: 99.37 }),
    );

    expect(Number(cash.amount)).toBe(99.37);
  });

  it("getSummary totals income/expense by method and nets them", async () => {
    const summaryTenant = `${tenantId}4`;
    const session = await runWithTenant(summaryTenant, () => service.openSession("1", 0));

    await runWithTenant(summaryTenant, () =>
      service.registerMovement({ cashSessionId: session.id, type: "income", method: "efectivo", amount: 100 }),
    );
    await runWithTenant(summaryTenant, () =>
      service.registerMovement({ cashSessionId: session.id, type: "income", method: "tarjeta", amount: 200 }),
    );
    await runWithTenant(summaryTenant, () =>
      service.registerMovement({ cashSessionId: session.id, type: "expense", method: "efectivo", amount: 30 }),
    );

    const summary = await runWithTenant(summaryTenant, () => service.getSummary(session.id));

    expect(summary.totalIncome).toBe(300);
    expect(summary.totalExpense).toBe(30);
    expect(summary.net).toBe(270);
    expect(summary.byMethod.efectivo).toEqual({ income: 100, expense: 30 });
    expect(summary.byMethod.tarjeta).toEqual({ income: 200, expense: 0 });
  });

  it("closeSession persists the closing balance and status", async () => {
    const closeTenant = `${tenantId}5`;
    const session = await runWithTenant(closeTenant, () => service.openSession("1", 500));

    const closed = await runWithTenant(closeTenant, () => service.closeSession(session.id, 480));

    expect(closed.status).toBe("closed");
    expect(Number(closed.closingBalance)).toBe(480);
    expect(closed.closedAt).not.toBeNull();
  });
});
