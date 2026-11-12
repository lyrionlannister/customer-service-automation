export type DashboardBusinessMetrics = {
  todayRevenue: number;
  todaySales: number;
  todayRepairRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  openRepairNotes: number;
  criticalStockItems: number;
  openCashSessions: number;
  lowStockThreshold: number;
};

type RepairNoteLike = {
  totalValue?: number | string | null;
  receivedAt?: string | null;
  status?: string | null;
};

type SaleLike = {
  totalValue?: number | string | null;
  createdAt?: string | null;
};

type InventoryLike = {
  quantityOnHand?: number | string | null;
};

type CashSessionLike = {
  status?: string | null;
};

const toNumber = (value: number | string | null | undefined): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isSameDay = (dateValue: string | null | undefined, dayKey: string): boolean => {
  if (!dateValue) return false;
  return dateValue.slice(0, 10) === dayKey;
};

// Semana en curso, lunes a domingo (mismo criterio ISO que isoWeek() del
// backend en reports.service.ts) -- no es contable/fiscal.
const startOfWeek = (date: Date): Date => {
  const start = new Date(date);
  const day = start.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);
  return start;
};

const isCurrentWeek = (dateValue: string | null | undefined, currentDate: Date): boolean => {
  if (!dateValue) return false;

  const incomingDate = new Date(dateValue);
  if (Number.isNaN(incomingDate.getTime())) return false;

  const weekStart = startOfWeek(currentDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return incomingDate >= weekStart && incomingDate < weekEnd;
};

const isCurrentMonth = (dateValue: string | null | undefined, currentDate: Date): boolean => {
  if (!dateValue) return false;

  const incomingDate = new Date(dateValue);
  if (Number.isNaN(incomingDate.getTime())) return false;

  return (
    incomingDate.getFullYear() === currentDate.getFullYear() &&
    incomingDate.getMonth() === currentDate.getMonth()
  );
};

export type BusinessSeriesPoint = { bucket: string; sales: number; repairs: number };

const dateKey = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
};

export const buildDailyBusinessSeries = (
  repairNotes: RepairNoteLike[] = [],
  sales: SaleLike[] = [],
  days = 30,
): BusinessSeriesPoint[] => {
  // Buckets en UTC puro (nunca medianoche local) -- dateKey() tambien extrae
  // la fecha en UTC de cada registro, y si el host corre en una zona detras
  // de UTC (ej. GMT-6), medianoche local ya cayo en el dia UTC anterior,
  // desalineando el bucket de "hoy" contra los registros reales.
  const [y, m, d] = new Date().toISOString().slice(0, 10).split("-").map(Number);
  const todayMidnightUtc = Date.UTC(y as number, (m as number) - 1, d as number);

  const points: BusinessSeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const bucketDate = new Date(todayMidnightUtc - i * 86_400_000);
    points.push({ bucket: bucketDate.toISOString().slice(0, 10), sales: 0, repairs: 0 });
  }
  const byKey = new Map(points.map((p) => [p.bucket, p]));

  for (const sale of sales) {
    const point = byKey.get(dateKey(sale.createdAt) ?? "");
    if (point) point.sales += toNumber(sale.totalValue);
  }
  for (const note of repairNotes) {
    const point = byKey.get(dateKey(note.receivedAt) ?? "");
    if (point) point.repairs += toNumber(note.totalValue);
  }

  return points.map((p) => ({
    ...p,
    sales: Number(p.sales.toFixed(2)),
    repairs: Number(p.repairs.toFixed(2)),
  }));
};

export const buildMonthlyBusinessSeries = (
  repairNotes: RepairNoteLike[] = [],
  sales: SaleLike[] = [],
  year = new Date().getFullYear(),
): { salesData: number[]; repairsData: number[] } => {
  const salesData = Array<number>(12).fill(0);
  const repairsData = Array<number>(12).fill(0);
  const yearPrefix = String(year);

  for (const sale of sales) {
    const key = dateKey(sale.createdAt);
    if (!key || !key.startsWith(yearPrefix)) continue;
    salesData[Number(key.slice(5, 7)) - 1] += toNumber(sale.totalValue);
  }
  for (const note of repairNotes) {
    const key = dateKey(note.receivedAt);
    if (!key || !key.startsWith(yearPrefix)) continue;
    repairsData[Number(key.slice(5, 7)) - 1] += toNumber(note.totalValue);
  }

  return {
    salesData: salesData.map((v) => Number(v.toFixed(2))),
    repairsData: repairsData.map((v) => Number(v.toFixed(2))),
  };
};

export const summarizeDashboardMetrics = (
  repairNotes: RepairNoteLike[] = [],
  sales: SaleLike[] = [],
  inventory: InventoryLike[] = [],
  cashSessions: CashSessionLike[] = [],
  lowStockThreshold = 3,
): DashboardBusinessMetrics => {
  const todayKey = new Date().toISOString().slice(0, 10);
  const now = new Date();

  const todayRepairRevenue = repairNotes.reduce((sum, note) => {
    if (!isSameDay(note.receivedAt ?? null, todayKey)) {
      return sum;
    }

    return sum + toNumber(note.totalValue);
  }, 0);

  const todaySalesRevenue = sales.reduce((sum, sale) => {
    if (!isSameDay(sale.createdAt ?? null, todayKey)) {
      return sum;
    }

    return sum + toNumber(sale.totalValue);
  }, 0);

  const weeklyRevenue = [...repairNotes, ...sales].reduce((sum, item) => {
    const dateValue = "receivedAt" in item ? item.receivedAt : "createdAt" in item ? item.createdAt : undefined;
    if (!isCurrentWeek(dateValue ?? null, now)) {
      return sum;
    }

    return sum + toNumber("totalValue" in item ? item.totalValue : undefined);
  }, 0);

  const monthlyRevenue = [...repairNotes, ...sales].reduce((sum, item) => {
    const dateValue = "receivedAt" in item ? item.receivedAt : "createdAt" in item ? item.createdAt : undefined;
    if (!isCurrentMonth(dateValue ?? null, now)) {
      return sum;
    }

    return sum + toNumber("totalValue" in item ? item.totalValue : undefined);
  }, 0);

  const openRepairNotes = repairNotes.filter((note) => {
    const normalized = (note.status ?? "").toLowerCase();
    return !["completed", "closed", "cancelled", "canceled", "delivered"].includes(normalized);
  }).length;

  const criticalStockItems = inventory.filter((item) => toNumber(item.quantityOnHand) <= lowStockThreshold).length;
  const openCashSessions = cashSessions.filter((session) => (session.status ?? "").toLowerCase() === "open").length;

  return {
    todayRevenue: Number((todayRepairRevenue + todaySalesRevenue).toFixed(2)),
    todaySales: Number(todaySalesRevenue.toFixed(2)),
    todayRepairRevenue: Number(todayRepairRevenue.toFixed(2)),
    weeklyRevenue: Number(weeklyRevenue.toFixed(2)),
    monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
    openRepairNotes,
    criticalStockItems,
    openCashSessions,
    lowStockThreshold,
  };
};
