import { useApiClient } from "@common/hooks/use-api-client";
import { authenticatedEventSourceUrl } from "@common/utils/auth-header";
import { useCallback, useEffect, useMemo, useState } from "react";

import { buildDailyBusinessSeries, buildMonthlyBusinessSeries, summarizeDashboardMetrics } from "../utils/dashboard-metrics";

export type Point = { bucket: string; count: number };

const MONTH_LABELS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export const useDashboardPage = () => {
  const { apiClient } = useApiClient();
  const [daily, setDaily] = useState<Point[]>([]);
  const [monthly, setMonthly] = useState<Point[]>([]);
  const [weekCount, setWeekCount] = useState(0);
  const [lastAt, setLastAt] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [businessMetrics, setBusinessMetrics] = useState(() =>
    summarizeDashboardMetrics([], [], [], []),
  );
  const [repairNotes, setRepairNotes] = useState<Array<Record<string, unknown>>>([]);
  const [sales, setSales] = useState<Array<Record<string, unknown>>>([]);

  const loadStats = useCallback(async () => {
    const [dailyRes, monthlyRes, weekRes, lastRes] = await Promise.all([
      apiClient("/chats/stats/daily"),
      apiClient(`/chats/stats/monthly?year=${year}`),
      apiClient("/chats/stats/weekly"),
      apiClient("/chats/stats/last-interaction"),
    ]);

    if (dailyRes.ok) setDaily((await dailyRes.json()) as Point[]);
    if (monthlyRes.ok) setMonthly((await monthlyRes.json()) as Point[]);
    if (weekRes.ok) setWeekCount(((await weekRes.json()) as { count: number }).count);
    if (lastRes.ok) setLastAt(((await lastRes.json()) as { lastAt: string | null }).lastAt);
  }, [apiClient, year]);

  const loadBusinessStats = useCallback(async () => {
    const [repairNotesRes, salesRes, inventoryRes, cashSessionsRes] = await Promise.all([
      apiClient("/repair-notes"),
      apiClient("/sales"),
      apiClient("/inventory"),
      apiClient("/cash/sessions"),
    ]);

    const repairNotesData = repairNotesRes.ok ? ((await repairNotesRes.json()) as Array<Record<string, unknown>>) : [];
    const salesData = salesRes.ok ? ((await salesRes.json()) as Array<Record<string, unknown>>) : [];
    const inventory = inventoryRes.ok ? ((await inventoryRes.json()) as Array<Record<string, unknown>>) : [];
    const cashSessions = cashSessionsRes.ok ? ((await cashSessionsRes.json()) as Array<Record<string, unknown>>) : [];

    setRepairNotes(repairNotesData);
    setSales(salesData);
    setBusinessMetrics(
      summarizeDashboardMetrics(
        repairNotesData as Parameters<typeof summarizeDashboardMetrics>[0],
        salesData as Parameters<typeof summarizeDashboardMetrics>[1],
        inventory as Parameters<typeof summarizeDashboardMetrics>[2],
        cashSessions as Parameters<typeof summarizeDashboardMetrics>[3],
      ),
    );
  }, [apiClient]);

  useEffect(() => {
    loadStats().catch(console.error);
    loadBusinessStats().catch(console.error);
  }, [loadBusinessStats, loadStats]);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
    const eventSource = new EventSource(authenticatedEventSourceUrl(`${baseUrl}/whatsapp/events`));

    const refresh = () => {
      loadStats().catch(console.error);
      loadBusinessStats().catch(console.error);
    };

    eventSource.addEventListener("message_received", refresh);
    eventSource.addEventListener("ready", refresh);
    eventSource.addEventListener("disconnected", refresh);

    return () => eventSource.close();
  }, [loadBusinessStats, loadStats]);

  const totalYear = useMemo(() => monthly.reduce((sum, point) => sum + point.count, 0), [monthly]);

  const todayCount = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return daily.find((point) => point.bucket === today)?.count ?? 0;
  }, [daily]);

  const lastInteraction = useMemo(() => {
    if (!lastAt) return "Sin datos";
    const date = new Date(lastAt);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  }, [lastAt]);

  const dailyCategories = useMemo(
    () => daily.map((point) => {
      const [, mm, dd] = point.bucket.split("-");
      return `${dd}/${mm}`;
    }),
    [daily],
  );

  const dailyBusinessSeries = useMemo(
    () => buildDailyBusinessSeries(repairNotes as Parameters<typeof buildDailyBusinessSeries>[0], sales as Parameters<typeof buildDailyBusinessSeries>[1]),
    [repairNotes, sales],
  );

  const dailyBusinessCategories = useMemo(
    () => dailyBusinessSeries.map((p) => {
      const [, mm, dd] = p.bucket.split("-");
      return `${dd}/${mm}`;
    }),
    [dailyBusinessSeries],
  );

  const monthlyBusinessSeries = useMemo(
    () => buildMonthlyBusinessSeries(repairNotes as Parameters<typeof buildMonthlyBusinessSeries>[0], sales as Parameters<typeof buildMonthlyBusinessSeries>[1], year),
    [repairNotes, sales, year],
  );

  return {
    daily,
    monthly,
    weekCount,
    lastAt,
    year,
    businessMetrics,
    totalYear,
    todayCount,
    lastInteraction,
    dailyCategories,
    monthLabels: MONTH_LABELS,
    setYear,
    dailyBusinessSeries,
    dailyBusinessCategories,
    monthlyBusinessSeries,
  };
};
