import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import AppDataSource from "../../../../src/core/config/data-source.js";
import { User } from "../../../../src/identity/auth/entities/user.entity.js";
import { UserDao } from "../../../../src/identity/auth/daos/user.dao.js";
import { RepairNote } from "../../../../src/commerce/repair-notes/entities/repair-note.entity.js";
import { RepairNoteItem } from "../../../../src/commerce/repair-notes/entities/repair-note-item.entity.js";
import { RepairNoteDao } from "../../../../src/commerce/repair-notes/daos/repair-note.dao.js";
import { RepairNoteItemDao } from "../../../../src/commerce/repair-notes/daos/repair-note-item.dao.js";
import { Sale } from "../../../../src/commerce/inventory/entities/sale.entity.js";
import { SaleItem } from "../../../../src/commerce/inventory/entities/sale-item.entity.js";
import { SaleDao } from "../../../../src/commerce/inventory/daos/sale.dao.js";
import { SaleItemDao } from "../../../../src/commerce/inventory/daos/sale-item.dao.js";
import { InventoryItem } from "../../../../src/commerce/inventory/entities/inventory-item.entity.js";
import { InventoryItemDao } from "../../../../src/commerce/inventory/daos/inventory-item.dao.js";
import { RevenueAttributionSetting } from "../../../../src/commerce/revenue-attribution/entities/revenue-attribution-setting.entity.js";
import { RevenueAttributionSettingDao } from "../../../../src/commerce/revenue-attribution/daos/revenue-attribution-setting.dao.js";
import { RevenueAttributionService } from "../../../../src/commerce/revenue-attribution/services/revenue-attribution.service.js";
import { ServiceType } from "../../../../src/commerce/service-types/entities/service-type.entity.js";
import { ServiceTypeDao } from "../../../../src/commerce/service-types/daos/service-type.dao.js";
import { RepairNoteServiceType } from "../../../../src/commerce/repair-notes/entities/repair-note-service-type.entity.js";
import { RepairNoteServiceTypeDao } from "../../../../src/commerce/repair-notes/daos/repair-note-service-type.dao.js";
import { ReportsService } from "../../../../src/reporting/reports/services/reports.service.js";
import { dateOnly } from "../../../../src/reporting/reports/utils/report-period.utils.js";
import { runWithTenant } from "../../../../src/core/tenancy/tenant-context.js";

const today = () => new Date().toISOString().split("T")[0] as string;
// Ventana amplia para no depender de que el reloj del host coincida con el
// del contenedor de Postgres (default sin periodo usa "hoy" de cada uno).
const WIDE_PERIOD = { periodStart: "2000-01-01", periodEnd: "2099-12-31" };

describe("ReportsService", () => {
  let reportsService: ReportsService;
  let userDao: UserDao;
  let repairNoteDao: RepairNoteDao;
  let repairNoteItemDao: RepairNoteItemDao;
  let saleDao: SaleDao;
  let saleItemDao: SaleItemDao;
  let inventoryItemDao: InventoryItemDao;
  let revenueAttributionService: RevenueAttributionService;
  let serviceTypeDao: ServiceTypeDao;
  let repairNoteServiceTypeDao: RepairNoteServiceTypeDao;
  const tenantId = `${Date.now()}6`;

  beforeAll(async () => {
    await AppDataSource.initialize();
    userDao = new UserDao(AppDataSource.getRepository(User));
    repairNoteDao = new RepairNoteDao(AppDataSource.getRepository(RepairNote));
    repairNoteItemDao = new RepairNoteItemDao(AppDataSource.getRepository(RepairNoteItem));
    saleDao = new SaleDao(AppDataSource.getRepository(Sale));
    saleItemDao = new SaleItemDao(AppDataSource.getRepository(SaleItem));
    inventoryItemDao = new InventoryItemDao(AppDataSource.getRepository(InventoryItem));
    revenueAttributionService = new RevenueAttributionService(
      new RevenueAttributionSettingDao(AppDataSource.getRepository(RevenueAttributionSetting)),
    );
    serviceTypeDao = new ServiceTypeDao(AppDataSource.getRepository(ServiceType));
    repairNoteServiceTypeDao = new RepairNoteServiceTypeDao(AppDataSource.getRepository(RepairNoteServiceType));
    reportsService = new ReportsService(
      repairNoteDao,
      repairNoteItemDao,
      saleDao,
      saleItemDao,
      inventoryItemDao,
      userDao,
      revenueAttributionService,
      serviceTypeDao,
      repairNoteServiceTypeDao,
    );
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe("getEmployeePerformance", () => {
    it("attributes totalValue, margin or labor-only revenue depending on the configured basis", async () => {
      const basisTenant = `${tenantId}1`;

      const employee = await runWithTenant(basisTenant, () =>
        userDao.create({
          firstName: "Tech",
          lastName: "Uno",
          email: `tech.${basisTenant}@test.local`,
          password: "x",
          role: "employee",
          salaryAmount: 3000,
          payCycle: "monthly",
        } as Partial<User>),
      );

      const item = await runWithTenant(basisTenant, () =>
        inventoryItemDao.create({
          localId: "1",
          name: "Pantalla",
          kind: "part",
          costPrice: 10,
          salePrice: 20,
        } as Partial<InventoryItem>),
      );

      const note = await runWithTenant(basisTenant, () =>
        repairNoteDao.create({
          controlNumber: 1,
          customerName: "Cliente",
          brand: "Samsung",
          model: "A1",
          reportedFailure: "Pantalla rota",
          totalValue: 500,
          receivedAt: today(),
          assignedEmployeeId: employee.id,
        } as Partial<RepairNote>),
      );
      await runWithTenant(basisTenant, () =>
        repairNoteItemDao.create({
          repairNoteId: note.id,
          inventoryItemId: item.id,
          quantity: 2,
          unitPrice: 20,
        } as Partial<RepairNoteItem>),
      );

      const sale = await runWithTenant(basisTenant, () =>
        saleDao.create({
          localId: "1",
          totalValue: 100,
          paymentMethod: "efectivo",
          createdByEmployeeId: employee.id,
        } as Partial<Sale>),
      );
      await runWithTenant(basisTenant, () =>
        saleItemDao.create({ saleId: sale.id, inventoryItemId: item.id, quantity: 1, unitPrice: 100 } as Partial<SaleItem>),
      );

      const getFor = async (basis: "total_value" | "margin" | "labor_only") => {
        await runWithTenant(basisTenant, () => revenueAttributionService.setBasis(basis));
        const report = await runWithTenant(basisTenant, () =>
          reportsService.getEmployeePerformance({ employeeId: employee.id, ...WIDE_PERIOD }),
        );
        return report.employees[0];
      };

      const totalValueResult = await getFor("total_value");
      expect(totalValueResult.attributedAmount).toBe(600); // 500 + 100
      expect(totalValueResult.repairNotesCount).toBe(1);
      expect(totalValueResult.salesCount).toBe(1);

      const marginResult = await getFor("margin");
      expect(marginResult.attributedAmount).toBe(570); // (500-20) + (100-10)

      const laborOnlyResult = await getFor("labor_only");
      expect(laborOnlyResult.attributedAmount).toBe(460); // (500-40) + (100-100)
    });

    it("excludes notes outside the period and prorates salary for a partial period", async () => {
      const periodTenant = `${tenantId}2`;

      const employee = await runWithTenant(periodTenant, () =>
        userDao.create({
          firstName: "Tech",
          lastName: "Dos",
          email: `tech.${periodTenant}@test.local`,
          password: "x",
          role: "employee",
          salaryAmount: 3000,
          payCycle: "monthly",
        } as Partial<User>),
      );

      await runWithTenant(periodTenant, () =>
        repairNoteDao.create({
          controlNumber: 1,
          customerName: "Dentro",
          brand: "A",
          model: "B",
          reportedFailure: "x",
          totalValue: 200,
          receivedAt: "2026-01-10",
          assignedEmployeeId: employee.id,
        } as Partial<RepairNote>),
      );
      await runWithTenant(periodTenant, () =>
        repairNoteDao.create({
          controlNumber: 2,
          customerName: "Fuera",
          brand: "A",
          model: "B",
          reportedFailure: "x",
          totalValue: 9999,
          receivedAt: "2026-02-15",
          assignedEmployeeId: employee.id,
        } as Partial<RepairNote>),
      );

      const report = await runWithTenant(periodTenant, () =>
        reportsService.getEmployeePerformance({
          employeeId: employee.id,
          periodStart: "2026-01-01",
          periodEnd: "2026-01-10",
        }),
      );

      expect(report.employees[0].attributedAmount).toBe(200);
      expect(report.employees[0].repairNotesCount).toBe(1);
      // 10 dias de 30 => salario prorrateado, nunca el mes completo.
      expect(report.employees[0].salaryAmount).toBe(1000);
    });
  });

  describe("getAccessorySales", () => {
    it("groups by item and computes total revenue and average ticket", async () => {
      const salesTenant = `${tenantId}3`;

      const itemA = await runWithTenant(salesTenant, () =>
        inventoryItemDao.create({ localId: "1", name: "Funda", kind: "accessory", costPrice: 5, salePrice: 15 } as Partial<InventoryItem>),
      );
      const itemB = await runWithTenant(salesTenant, () =>
        inventoryItemDao.create({ localId: "1", name: "Cable", kind: "accessory", costPrice: 3, salePrice: 10 } as Partial<InventoryItem>),
      );

      const saleA = await runWithTenant(salesTenant, () =>
        saleDao.create({ localId: "1", totalValue: 30, paymentMethod: "efectivo" } as Partial<Sale>),
      );
      await runWithTenant(salesTenant, () =>
        saleItemDao.create({ saleId: saleA.id, inventoryItemId: itemA.id, quantity: 2, unitPrice: 15 } as Partial<SaleItem>),
      );

      const saleB = await runWithTenant(salesTenant, () =>
        saleDao.create({ localId: "1", totalValue: 10, paymentMethod: "tarjeta" } as Partial<Sale>),
      );
      await runWithTenant(salesTenant, () =>
        saleItemDao.create({ saleId: saleB.id, inventoryItemId: itemB.id, quantity: 1, unitPrice: 10 } as Partial<SaleItem>),
      );

      const report = await runWithTenant(salesTenant, () => reportsService.getAccessorySales(WIDE_PERIOD));

      expect(report.salesCount).toBe(2);
      expect(report.totalRevenue).toBe(40);
      expect(report.averageTicket).toBe(20);
      expect(report.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ label: "Funda", quantity: 2, revenue: 30 }),
          expect.objectContaining({ label: "Cable", quantity: 1, revenue: 10 }),
        ]),
      );
    });

    it("groups by day when groupBy=day", async () => {
      const dayTenant = `${tenantId}4`;
      const item = await runWithTenant(dayTenant, () =>
        inventoryItemDao.create({ localId: "1", name: "Mica", kind: "accessory", costPrice: 2, salePrice: 8 } as Partial<InventoryItem>),
      );
      const sale = await runWithTenant(dayTenant, () =>
        saleDao.create({ localId: "1", totalValue: 8, paymentMethod: "efectivo" } as Partial<Sale>),
      );
      await runWithTenant(dayTenant, () =>
        saleItemDao.create({ saleId: sale.id, inventoryItemId: item.id, quantity: 1, unitPrice: 8 } as Partial<SaleItem>),
      );

      const report = await runWithTenant(dayTenant, () =>
        reportsService.getAccessorySales({ ...WIDE_PERIOD, groupBy: "day" }),
      );

      expect(report.data).toHaveLength(1);
      expect(report.data[0]?.key).toBe(dateOnly(sale.createdAt));
      expect(report.data[0]?.revenue).toBe(8);
    });
  });

  describe("getRepairNotesByType", () => {
    it("aggregates notes by service type and by status", async () => {
      const typeTenant = `${tenantId}5`;

      const repairType = await runWithTenant(typeTenant, () => serviceTypeDao.create({ name: "Reparación" } as Partial<ServiceType>));
      const maintenanceType = await runWithTenant(typeTenant, () => serviceTypeDao.create({ name: "Mantenimiento" } as Partial<ServiceType>));

      const noteA = await runWithTenant(typeTenant, () =>
        repairNoteDao.create({
          controlNumber: 1,
          customerName: "A",
          brand: "A",
          model: "A",
          reportedFailure: "x",
          totalValue: 200,
          receivedAt: today(),
          status: "received",
        } as Partial<RepairNote>),
      );
      await runWithTenant(typeTenant, () =>
        repairNoteServiceTypeDao.create({ repairNoteId: noteA.id, serviceTypeId: repairType.id } as Partial<RepairNoteServiceType>),
      );

      const noteB = await runWithTenant(typeTenant, () =>
        repairNoteDao.create({
          controlNumber: 2,
          customerName: "B",
          brand: "A",
          model: "A",
          reportedFailure: "x",
          totalValue: 300,
          receivedAt: today(),
          status: "done",
        } as Partial<RepairNote>),
      );
      await runWithTenant(typeTenant, () =>
        repairNoteServiceTypeDao.create({ repairNoteId: noteB.id, serviceTypeId: repairType.id } as Partial<RepairNoteServiceType>),
      );
      await runWithTenant(typeTenant, () =>
        repairNoteServiceTypeDao.create({ repairNoteId: noteB.id, serviceTypeId: maintenanceType.id } as Partial<RepairNoteServiceType>),
      );

      const report = await runWithTenant(typeTenant, () => reportsService.getRepairNotesByType({}));

      expect(report.totalNotes).toBe(2);
      expect(report.totalRevenue).toBe(500);
      expect(report.byType.find((t) => t.type === repairType.id)).toEqual(
        expect.objectContaining({ label: "Reparación", count: 2, totalValue: 500 }),
      );
      expect(report.byType.find((t) => t.type === maintenanceType.id)).toEqual(
        expect.objectContaining({ label: "Mantenimiento", count: 1, totalValue: 300 }),
      );
      expect(report.byStatus).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ status: "received", count: 1, totalValue: 200 }),
          expect.objectContaining({ status: "done", count: 1, totalValue: 300 }),
        ]),
      );
    });
  });
});
