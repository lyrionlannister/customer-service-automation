import { useCallback, useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { MessageSquare, CalendarDays, Clock, CalendarCheck2, TrendingUp } from "lucide-react";
import Input from "@ui/inputs/input";
import { useApiClient } from "../../common/hooks/use-api-client";
import PageMeta from "@common/pages/page-meta";

type Point = { bucket: string; count: number };

const MONTH_LABELS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const DashboardPage: React.FC = () => {
  const { apiClient } = useApiClient();
  const [daily, setDaily] = useState<Point[]>([]);
  const [monthly, setMonthly] = useState<Point[]>([]);
  const [weekCount, setWeekCount] = useState(0);
  const [lastAt, setLastAt] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());

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

  useEffect(() => {
    loadStats().catch(console.error);
  }, [loadStats]);

  useEffect(() => {
    const eventSource = new EventSource("/api/v1/whatsapp/events");
    const refresh = () => loadStats().catch(console.error);
    eventSource.addEventListener("message_received", refresh);
    eventSource.addEventListener("ready", refresh);
    eventSource.addEventListener("disconnected", refresh);
    return () => eventSource.close();
  }, [loadStats]);

  const totalYear = useMemo(() => monthly.reduce((s, p) => s + p.count, 0), [monthly]);

  const todayCount = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return daily.find((p) => p.bucket === today)?.count ?? 0;
  }, [daily]);

  const lastInteraction = useMemo(() => {
    if (!lastAt) return "Sin datos";
    const d = new Date(lastAt);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  }, [lastAt]);

  const dailyCategories = daily.map((p) => {
    const [, mm, dd] = p.bucket.split("-");
    return `${dd}/${mm}`;
  });

  const barOptions: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "inherit",
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 3, colors: ["transparent"] },
    xaxis: {
      categories: MONTH_LABELS,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { title: { text: undefined } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
      y: { formatter: (val: number) => `${val} conversaciones` },
    },
  };

  const areaOptions: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "inherit",
      type: "area",
      height: 350,
      toolbar: { show: false },
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.4, opacityTo: 0 },
    },
    markers: { size: 0, hover: { size: 5 } },
    dataLabels: { enabled: false },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories: dailyCategories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { rotate: 0, hideOverlappingLabels: true },
      tooltip: { enabled: false },
    },
    yaxis: { labels: { style: { colors: ["#6B7280"] } }, title: { text: "" } },
    tooltip: {
      enabled: true,
      y: { formatter: (val: number) => `${val} mensajes` },
    },
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Dashboard" description="Panel de control" />
      <div>
        <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400">
          Panel inicial
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Métricas en tiempo real de conversaciones.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 md:gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
            <Clock className="size-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Última interacción
            </span>
            <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
              {lastInteraction}
            </h4>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <CalendarCheck2 className="size-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Mensajes hoy
            </span>
            <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
              {todayCount}
            </h4>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30">
            <TrendingUp className="size-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Esta semana
            </span>
            <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
              {weekCount}
            </h4>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <MessageSquare className="size-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total conversaciones {year}
            </span>
            <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
              {totalYear}
            </h4>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
            <CalendarDays className="size-6 text-orange-500 dark:text-orange-400" />
          </div>
          <div className="mt-5">
            <span className="mb-2 block text-sm text-gray-500 dark:text-gray-400">
              Filtrar por año
            </span>
            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
          <div className="mb-1">
            <h3 className="text-lg font-semibold text-brand-600 dark:text-brand-400">
              Conversaciones por día
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Últimos 30 días
            </p>
          </div>
          <div className="max-w-full overflow-x-auto">
            <Chart
              options={areaOptions}
              series={[{ name: "Mensajes", data: daily.map((p) => p.count) }]}
              type="area"
              height={350}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
          <div className="mb-1">
            <h3 className="text-lg font-semibold text-brand-600 dark:text-brand-400">
              Conversaciones por mes
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Total mensual del año {year}
            </p>
          </div>
          <div className="max-w-full overflow-x-auto">
            <Chart
              options={barOptions}
              series={[{ name: "Conversaciones", data: monthly.map((p) => p.count) }]}
              type="bar"
              height={350}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
