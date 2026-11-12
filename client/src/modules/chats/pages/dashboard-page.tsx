import { useMemo } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import {
  MessageSquare,
  CalendarDays,
  Clock,
  CalendarCheck2,
  TrendingUp,
  Wallet,
  PackageOpen,
  Banknote,
} from "lucide-react";
import Input from "@ui/inputs/input";
import PageShell from "@common/components/page-shell/page-shell";
import { useDashboardPage } from "../hooks/use-dashboard-page";

const DashboardPage: React.FC = () => {
  const {
    daily,
    monthly,
    weekCount,
    year,
    businessMetrics,
    totalYear,
    todayCount,
    lastInteraction,
    dailyCategories,
    monthLabels,
    setYear,
    dailyBusinessSeries,
    dailyBusinessCategories,
    monthlyBusinessSeries,
  } = useDashboardPage();

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [],
  );


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
      categories: monthLabels,
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

  const businessAreaOptions: ApexOptions = {
    colors: ["#12b76a", "#465fff"],
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
      categories: dailyBusinessCategories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { rotate: 0, hideOverlappingLabels: true },
      tooltip: { enabled: false },
    },
    yaxis: { labels: { style: { colors: ["#6B7280"] } }, title: { text: "" } },
    legend: { show: true, position: "top", horizontalAlign: "left" },
    tooltip: {
      enabled: true,
      y: { formatter: (val: number) => currencyFormatter.format(val) },
    },
  };

  const businessStackedBarOptions: ApexOptions = {
    colors: ["#12b76a", "#465fff"],
    chart: {
      fontFamily: "inherit",
      type: "bar",
      height: 350,
      stacked: true,
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
      categories: monthLabels,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { title: { text: undefined } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    legend: { show: true, position: "top", horizontalAlign: "left" },
    tooltip: {
      y: { formatter: (val: number) => currencyFormatter.format(val) },
    },
  };

  return (
    <PageShell
      title="Panel inicial"
      description="Métricas operativas del negocio y la atención."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 md:gap-5">
        <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 md:p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/10">
            <Wallet className="size-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">Ingreso del día</span>
            <h4 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {currencyFormatter.format(businessMetrics.todayRevenue)}
            </h4>
          </div>
        </div>

        <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 md:p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
            <Banknote className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">Ventas este mes</span>
            <h4 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {currencyFormatter.format(businessMetrics.monthlyRevenue)}
            </h4>
          </div>
        </div>

        <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 md:p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-500/10">
            <Banknote className="size-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">Ventas esta semana</span>
            <h4 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {currencyFormatter.format(businessMetrics.weeklyRevenue)}
            </h4>
          </div>
        </div>

        <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 md:p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-500/10">
            <PackageOpen className="size-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">Notas abiertas</span>
            <h4 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {businessMetrics.openRepairNotes}
            </h4>
          </div>
        </div>

        <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 md:p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
            <TrendingUp className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">Stock crítico</span>
            <h4 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {businessMetrics.criticalStockItems}
            </h4>
          </div>
        </div>

        <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 md:p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-500/10">
            <CalendarDays className="size-5 text-orange-500 dark:text-orange-400" />
          </div>
          <div className="mt-4">
            <span className="mb-2 block text-sm text-gray-500 dark:text-gray-400">Caja abierta</span>
            <h4 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {businessMetrics.openCashSessions}
            </h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 md:gap-6">
        <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg dark:border-gray-800 dark:bg-white/3 md:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
            <Clock className="size-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">Última interacción</span>
            <h4 className="mt-2 text-xl font-bold text-gray-800 dark:text-white/90">{lastInteraction}</h4>
          </div>
        </div>

        <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg dark:border-gray-800 dark:bg-white/3 md:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <CalendarCheck2 className="size-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">Mensajes hoy</span>
            <h4 className="mt-2 text-xl font-bold text-gray-800 dark:text-white/90">{todayCount}</h4>
          </div>
        </div>

        <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg dark:border-gray-800 dark:bg-white/3 md:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30">
            <TrendingUp className="size-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">Esta semana</span>
            <h4 className="mt-2 text-xl font-bold text-gray-800 dark:text-white/90">{weekCount}</h4>
          </div>
        </div>

        <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg dark:border-gray-800 dark:bg-white/3 md:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <MessageSquare className="size-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total conversaciones {year}</span>
            <h4 className="mt-2 text-xl font-bold text-gray-800 dark:text-white/90">{totalYear}</h4>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
            <CalendarDays className="size-6 text-orange-500 dark:text-orange-400" />
          </div>
          <div className="mt-5">
            <span className="mb-2 block text-sm text-gray-500 dark:text-gray-400">Filtrar por año</span>
            <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
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

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
          <div className="mb-1">
            <h3 className="text-lg font-semibold text-brand-600 dark:text-brand-400">
              Ventas y reparaciones por día
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Últimos 30 días
            </p>
          </div>
          <div className="max-w-full overflow-x-auto">
            <Chart
              options={businessAreaOptions}
              series={[
                { name: "Ventas", data: dailyBusinessSeries.map((p) => p.sales) },
                { name: "Reparaciones", data: dailyBusinessSeries.map((p) => p.repairs) },
              ]}
              type="area"
              height={350}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
          <div className="mb-1">
            <h3 className="text-lg font-semibold text-brand-600 dark:text-brand-400">
              Ingresos por mes: ventas vs. reparaciones
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Total mensual del año {year}
            </p>
          </div>
          <div className="max-w-full overflow-x-auto">
            <Chart
              options={businessStackedBarOptions}
              series={[
                { name: "Ventas", data: monthlyBusinessSeries.salesData },
                { name: "Reparaciones", data: monthlyBusinessSeries.repairsData },
              ]}
              type="bar"
              height={350}
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default DashboardPage;
