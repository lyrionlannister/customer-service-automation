import { describe, expect, it } from "vitest";
import {
  buildDailyBusinessSeries,
  buildMonthlyBusinessSeries,
  summarizeDashboardMetrics,
} from "../../src/modules/chats/utils/dashboard-metrics";

describe("summarizeDashboardMetrics", () => {
  it("aggregates revenue, open repair notes, and stock alerts from live business data", () => {
    const today = new Date().toISOString().slice(0, 10);
    const repairNotes = [
      { totalValue: "150.00", status: "received", receivedAt: today },
      { totalValue: "300.00", status: "completed", receivedAt: "2026-11-01" },
      { totalValue: "80.00", status: "received", receivedAt: today },
    ];
    const sales = [
      { totalValue: "200.00", createdAt: today },
      { totalValue: "100.00", createdAt: "2026-11-01" },
    ];
    const inventory = [
      { quantityOnHand: 0 },
      { quantityOnHand: 5 },
      { quantityOnHand: 3 },
    ];
    const cashSessions = [{ status: "open" }, { status: "closed" }];

    const summary = summarizeDashboardMetrics(repairNotes, sales, inventory, cashSessions);

    expect(summary.todayRevenue).toBe(430);
    expect(summary.todaySales).toBe(200);
    expect(summary.todayRepairRevenue).toBe(230);
    expect(summary.openRepairNotes).toBe(2);
    expect(summary.criticalStockItems).toBe(2);
    expect(summary.openCashSessions).toBe(1);
  });

  it("sums weekly revenue only from items dated within the current Monday-Sunday week", () => {
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 8);
    const lastWeekKey = lastWeek.toISOString().slice(0, 10);

    const repairNotes = [{ totalValue: "150.00", status: "received", receivedAt: todayKey }];
    const sales = [
      { totalValue: "200.00", createdAt: todayKey },
      { totalValue: "999.00", createdAt: lastWeekKey },
    ];

    const summary = summarizeDashboardMetrics(repairNotes, sales, [], []);

    expect(summary.weeklyRevenue).toBe(350);
  });
});

describe("buildDailyBusinessSeries", () => {
  it("buckets sales and repair revenue into the last 30 days, dropping older entries", () => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 40);
    const oldKey = oldDate.toISOString().slice(0, 10);

    const repairNotes = [{ totalValue: "150.00", receivedAt: todayKey }, { totalValue: "999.00", receivedAt: oldKey }];
    const sales = [{ totalValue: "50.00", createdAt: todayKey }, { totalValue: "999.00", createdAt: oldKey }];

    const series = buildDailyBusinessSeries(repairNotes, sales, 30);

    expect(series).toHaveLength(30);
    expect(series[29]).toEqual({ bucket: todayKey, sales: 50, repairs: 150 });
    expect(series.some((p) => p.bucket === oldKey)).toBe(false);
  });
});

describe("buildMonthlyBusinessSeries", () => {
  it("sums sales and repair revenue per month for the given year only", () => {
    const repairNotes = [
      { totalValue: "100.00", receivedAt: "2026-03-05" },
      { totalValue: "999.00", receivedAt: "2025-03-05" },
    ];
    const sales = [{ totalValue: "200.00", createdAt: "2026-03-20" }];

    const { salesData, repairsData } = buildMonthlyBusinessSeries(repairNotes, sales, 2026);

    expect(salesData[2]).toBe(200);
    expect(repairsData[2]).toBe(100);
    expect(salesData.reduce((a, b) => a + b, 0)).toBe(200);
  });
});
