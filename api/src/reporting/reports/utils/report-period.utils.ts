// Los reportes de este modulo trabajan con fechas en formato 'YYYY-MM-DD':
// comparan como string (el formato ISO ordena lexicograficamente igual que
// temporalmente) para no andar parseando Date en cada filtro.
export interface ResolvedPeriod {
  start: string;
  end: string;
}

const toDateOnly = (date: Date): string => date.toISOString().split("T")[0] as string;

export function resolvePeriod(periodStart?: string, periodEnd?: string): ResolvedPeriod {
  // Siempre en UTC (nunca Date(y, m, d) con componentes locales): evita que
  // el default de periodo se corra un dia segun la zona horaria del host.
  const todayStr = toDateOnly(new Date());
  const firstOfMonthStr = `${todayStr.slice(0, 7)}-01`;
  return {
    start: periodStart ?? firstOfMonthStr,
    end: periodEnd ?? todayStr,
  };
}

export function dateOnly(value: string | Date): string {
  return typeof value === "string" ? (value.length > 10 ? value.slice(0, 10) : value) : toDateOnly(value);
}

export function inRange(value: string | Date, start: string, end: string): boolean {
  const d = dateOnly(value);
  return d >= start && d <= end;
}

export function dayCount(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

// Semana ISO-8601 (lunes a domingo), usada solo para agrupar ventas por
// semana en el reporte de accesorios -- no es contable/fiscal.
export function isoWeek(value: string | Date): string {
  const date = new Date(dateOnly(value));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
