import { useCallback, useEffect, useMemo, useState } from "react";
import { Workflow } from "lucide-react";
import Button from "../../common/components/ui/button/Button";
import { useApiClient } from "../../common/hooks/use-api-client";

type Point = { bucket: string; count: number };

function LineChart({ data, color }: { data: Point[]; color: string }) {
  const width = 900;
  const height = 220;
  const padding = 24;
  const max = Math.max(...data.map((d) => d.count), 1);
  const path = data
    .map((d, i) => {
      const x = padding + (i * (width - padding * 2)) / Math.max(data.length - 1, 1);
      const y = height - padding - (d.count / max) * (height - padding * 2);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
      <path d={path} fill="none" stroke={color} strokeWidth={3} />
    </svg>
  );
}

function BarChart({ data }: { data: Point[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="h-56 flex items-end gap-2">
      {data.map((d) => (
        <div key={d.bucket} className="flex-1">
          <div className="rounded-t bg-brand-500" style={{ height: `${(d.count / max) * 100}%` }} />
        </div>
      ))}
    </div>
  );
}

const DashboardPage: React.FC = () => {
  const { apiClient } = useApiClient();
  const [daily, setDaily] = useState<Point[]>([]);
  const [monthly, setMonthly] = useState<Point[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());

  const loadStats = useCallback(async () => {
    const [dailyResponse, monthlyResponse] = await Promise.all([
      apiClient("/chats/stats/daily"),
      apiClient(`/chats/stats/monthly?year=${year}`),
    ]);

    if (dailyResponse.ok) setDaily((await dailyResponse.json()) as Point[]);
    if (monthlyResponse.ok) setMonthly((await monthlyResponse.json()) as Point[]);
  }, [apiClient, year]);

  useEffect(() => {
    loadStats().catch(console.error);
  }, [loadStats]);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
    const eventSource = new EventSource(`${baseUrl}/whatsapp/events`);
    const refresh = () => loadStats().catch(console.error);
    eventSource.addEventListener("message_received", refresh);
    eventSource.addEventListener("ready", refresh);
    eventSource.addEventListener("disconnected", refresh);
    return () => eventSource.close();
  }, [loadStats]);

  const totalMonth = useMemo(() => monthly.reduce((acc, item) => acc + item.count, 0), [monthly]);

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-brand-600">Panel inicial</h1>
          <p className="text-sm text-gray-500">Métricas en tiempo real de conversaciones.</p>
        </div>
        <a href="https://n8n.io" target="_blank" rel="noreferrer">
          <Button startIcon={<Workflow className="h-4 w-4" />}>Ir a n8n</Button>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border p-5">Total del año {year}: {totalMonth}</div>
        <div className="rounded-2xl border p-5">Último día registrado: {daily[daily.length - 1]?.count ?? 0}</div>
        <div className="rounded-2xl border p-5">
          <label className="text-sm mr-2">Año</label>
          <input className="border rounded px-2 py-1" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
        </div>
      </div>

      <div className="rounded-2xl border p-5">
        <h2 className="font-semibold mb-2">Conversaciones por día</h2>
        <LineChart data={daily} color="#465fff" />
      </div>
      <div className="rounded-2xl border p-5">
        <h2 className="font-semibold mb-2">Conversaciones por mes (línea)</h2>
        <LineChart data={monthly} color="#12b76a" />
      </div>
      <div className="rounded-2xl border p-5">
        <h2 className="font-semibold mb-2">Conteo por mes ({year})</h2>
        <BarChart data={monthly} />
      </div>
    </div>
  );
};

export default DashboardPage;
