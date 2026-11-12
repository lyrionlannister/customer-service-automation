import { RepairNoteDao } from "../../../commerce/repair-notes/daos/repair-note.dao.js";
import { RepairNoteItemDao } from "../../../commerce/repair-notes/daos/repair-note-item.dao.js";
import { SaleDao } from "../../../commerce/inventory/daos/sale.dao.js";
import { SaleItemDao } from "../../../commerce/inventory/daos/sale-item.dao.js";
import { InventoryItemDao } from "../../../commerce/inventory/daos/inventory-item.dao.js";
import { UserDao } from "../../../identity/auth/daos/user.dao.js";
import { PayCycle } from "../../../identity/auth/entities/user.entity.js";
import { RevenueAttributionService, attributedAmount } from "../../../commerce/revenue-attribution/services/revenue-attribution.service.js";
import { ServiceTypeDao } from "../../../commerce/service-types/daos/service-type.dao.js";
import { RepairNoteServiceTypeDao } from "../../../commerce/repair-notes/daos/repair-note-service-type.dao.js";
import { AccessorySalesGroupBy } from "../dtos/accessory-sales-query.dto.js";
import { dateOnly, dayCount, inRange, isoWeek, resolvePeriod, round2 } from "../utils/report-period.utils.js";

const CYCLE_DAYS: Record<PayCycle, number> = { weekly: 7, biweekly: 15, monthly: 30 };

function prorateSalary(salaryAmount: number | null, payCycle: PayCycle | null, periodDays: number): number {
  if (!salaryAmount || !payCycle) return 0;
  return (Number(salaryAmount) / CYCLE_DAYS[payCycle]) * periodDays;
}

export class ReportsService {
  constructor(
    private repairNoteDao: RepairNoteDao,
    private repairNoteItemDao: RepairNoteItemDao,
    private saleDao: SaleDao,
    private saleItemDao: SaleItemDao,
    private inventoryItemDao: InventoryItemDao,
    private userDao: UserDao,
    private revenueAttributionService: RevenueAttributionService,
    private serviceTypeDao: ServiceTypeDao,
    private repairNoteServiceTypeDao: RepairNoteServiceTypeDao,
  ) {}

  async getEmployeePerformance(query: { employeeId?: string; periodStart?: string; periodEnd?: string }) {
    const { start, end } = resolvePeriod(query.periodStart, query.periodEnd);
    const periodDays = dayCount(start, end);

    const [employees, notes, sales, noteItems, saleItems, inventoryItems, setting] = await Promise.all([
      this.userDao.findAll(),
      this.repairNoteDao.findAll(),
      this.saleDao.findAll(),
      this.repairNoteItemDao.findAll(),
      this.saleItemDao.findAll(),
      this.inventoryItemDao.findAll(),
      this.revenueAttributionService.getSetting(),
    ]);

    const costById = new Map(inventoryItems.map((i) => [i.id, Number(i.costPrice)]));
    const notesInPeriod = notes.filter((n) => inRange(n.receivedAt, start, end));
    const salesInPeriod = sales.filter((s) => inRange(s.createdAt, start, end));

    const noteItemsByNote = new Map<string, typeof noteItems>();
    for (const item of noteItems) {
      noteItemsByNote.set(item.repairNoteId, [...(noteItemsByNote.get(item.repairNoteId) ?? []), item]);
    }
    const saleItemsBySale = new Map<string, typeof saleItems>();
    for (const item of saleItems) {
      saleItemsBySale.set(item.saleId, [...(saleItemsBySale.get(item.saleId) ?? []), item]);
    }

    const targetEmployees = query.employeeId ? employees.filter((e) => e.id === query.employeeId) : employees;

    const result = targetEmployees.map((employee) => {
      const empNotes = notesInPeriod.filter((n) => n.assignedEmployeeId === employee.id);
      const empSales = salesInPeriod.filter((s) => s.createdByEmployeeId === employee.id);

      let attributed = 0;
      for (const note of empNotes) {
        const items = noteItemsByNote.get(note.id) ?? [];
        const itemsCost = items.reduce((sum, i) => sum + i.quantity * (costById.get(i.inventoryItemId) ?? 0), 0);
        const itemsSalePrice = items.reduce((sum, i) => sum + i.quantity * Number(i.unitPrice), 0);
        attributed += attributedAmount(Number(note.totalValue), itemsCost, itemsSalePrice, setting.attributionBasis);
      }
      for (const sale of empSales) {
        const items = saleItemsBySale.get(sale.id) ?? [];
        const itemsCost = items.reduce((sum, i) => sum + i.quantity * (costById.get(i.inventoryItemId) ?? 0), 0);
        const itemsSalePrice = items.reduce((sum, i) => sum + i.quantity * Number(i.unitPrice), 0);
        attributed += attributedAmount(Number(sale.totalValue), itemsCost, itemsSalePrice, setting.attributionBasis);
      }

      const salaryForPeriod = prorateSalary(employee.salaryAmount, employee.payCycle, periodDays);

      return {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
        attributedAmount: round2(attributed),
        salaryAmount: round2(salaryForPeriod),
        coversSalary: attributed >= salaryForPeriod,
        repairNotesCount: empNotes.length,
        salesCount: empSales.length,
      };
    });

    return { attributionBasis: setting.attributionBasis, periodStart: start, periodEnd: end, employees: result };
  }

  async getAccessorySales(query: { periodStart?: string; periodEnd?: string; groupBy?: AccessorySalesGroupBy }) {
    const { start, end } = resolvePeriod(query.periodStart, query.periodEnd);
    const groupBy = query.groupBy ?? "item";

    const [sales, saleItems, inventoryItems] = await Promise.all([
      this.saleDao.findAll(),
      this.saleItemDao.findAll(),
      this.inventoryItemDao.findAll(),
    ]);

    const salesInPeriod = sales.filter((s) => inRange(s.createdAt, start, end));
    const salesById = new Map(salesInPeriod.map((s) => [s.id, s]));
    const itemsInPeriod = saleItems.filter((i) => salesById.has(i.saleId));
    const nameById = new Map(inventoryItems.map((i) => [i.id, i.name]));

    const totalRevenue = round2(salesInPeriod.reduce((sum, s) => sum + Number(s.totalValue), 0));
    const salesCount = salesInPeriod.length;
    const averageTicket = salesCount > 0 ? round2(totalRevenue / salesCount) : 0;

    const groups = new Map<string, { label: string; quantity: number; revenue: number }>();

    if (groupBy === "item") {
      for (const item of itemsInPeriod) {
        const entry = groups.get(item.inventoryItemId) ?? {
          label: nameById.get(item.inventoryItemId) ?? "Item eliminado",
          quantity: 0,
          revenue: 0,
        };
        entry.quantity += item.quantity;
        entry.revenue += item.quantity * Number(item.unitPrice);
        groups.set(item.inventoryItemId, entry);
      }
    } else {
      for (const sale of salesInPeriod) {
        const key = groupBy === "day" ? dateOnly(sale.createdAt) : isoWeek(sale.createdAt);
        const entry = groups.get(key) ?? { label: key, quantity: 0, revenue: 0 };
        entry.revenue += Number(sale.totalValue);
        groups.set(key, entry);
      }
      for (const item of itemsInPeriod) {
        const sale = salesById.get(item.saleId);
        if (!sale) continue;
        const key = groupBy === "day" ? dateOnly(sale.createdAt) : isoWeek(sale.createdAt);
        const entry = groups.get(key);
        if (entry) entry.quantity += item.quantity;
      }
    }

    const data = Array.from(groups.entries())
      .map(([key, v]) => ({ key, label: v.label, quantity: v.quantity, revenue: round2(v.revenue) }))
      .sort((a, b) => (groupBy === "item" ? b.revenue - a.revenue : a.key.localeCompare(b.key)));

    return { periodStart: start, periodEnd: end, groupBy, totalRevenue, averageTicket, salesCount, data };
  }

  async getRepairNotesByType(query: { periodStart?: string; periodEnd?: string }) {
    const { start, end } = resolvePeriod(query.periodStart, query.periodEnd);
    const [notes, serviceTypes, links] = await Promise.all([
      this.repairNoteDao.findAll(),
      this.serviceTypeDao.findAllOrdered(),
      this.repairNoteServiceTypeDao.findAll(),
    ]);
    const notesInPeriod = notes.filter((n) => inRange(n.receivedAt, start, end));
    const notesInPeriodById = new Map(notesInPeriod.map((n) => [n.id, n]));

    const totalNotes = notesInPeriod.length;
    const totalRevenue = round2(notesInPeriod.reduce((sum, n) => sum + Number(n.totalValue), 0));

    const noteIdsByType = new Map<string, Set<string>>();
    for (const link of links) {
      if (!notesInPeriodById.has(link.repairNoteId)) continue;
      const set = noteIdsByType.get(link.serviceTypeId) ?? new Set<string>();
      set.add(link.repairNoteId);
      noteIdsByType.set(link.serviceTypeId, set);
    }

    const byType = serviceTypes.map((type) => {
      const noteIds = noteIdsByType.get(type.id) ?? new Set<string>();
      const matched = Array.from(noteIds)
        .map((id) => notesInPeriodById.get(id))
        .filter((n): n is NonNullable<typeof n> => Boolean(n));
      return {
        type: type.id,
        label: type.name,
        count: matched.length,
        totalValue: round2(matched.reduce((sum, n) => sum + Number(n.totalValue), 0)),
      };
    });

    const statusMap = new Map<string, { count: number; totalValue: number }>();
    for (const note of notesInPeriod) {
      const entry = statusMap.get(note.status) ?? { count: 0, totalValue: 0 };
      entry.count += 1;
      entry.totalValue += Number(note.totalValue);
      statusMap.set(note.status, entry);
    }
    const byStatus = Array.from(statusMap.entries()).map(([status, v]) => ({
      status,
      count: v.count,
      totalValue: round2(v.totalValue),
    }));

    return { periodStart: start, periodEnd: end, totalNotes, totalRevenue, byType, byStatus };
  }
}
