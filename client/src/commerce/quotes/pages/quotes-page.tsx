import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, FileText, Pencil, Trash2, Check, X, Search } from "lucide-react";
import { useQuotes, type QuoteStatus } from "../hooks/use-quotes";
import { useQuotesPage } from "../hooks/use-quotes-page";
import Button from "@ui/button/button";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@ui/table/table";
import PageShell from "@common/components/page-shell/page-shell";

const STATUS_CONFIG: Record<QuoteStatus, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  accepted: { label: "Aceptada", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  rejected: { label: "Rechazada", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);

const QuotesPage: React.FC = () => {
  const navigate = useNavigate();
  const { quotes, loading, error, fetchQuotes, deleteQuote, setStatus } = useQuotes();
  const { search, setSearch, statusFilter, setStatusFilter, deletingId, filteredQuotes, handleDelete, handleStatusChange } =
    useQuotesPage({ quotes, deleteQuote, setStatus });

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return (
    <PageShell
      title="Cotizaciones"
      description="Genera y da seguimiento a cotizaciones para clientes."
      action={
        <Button
          variant="primary"
          startIcon={<Plus className="size-4" />}
          onClick={() => navigate("/admin/quotes/new")}
        >
          Nueva cotización
        </Button>
      }
    >
      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as QuoteStatus | "all")}
          className="rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="accepted">Aceptada</option>
          <option value="rejected">Rechazada</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Cargando cotizaciones...</div>
        ) : filteredQuotes.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {quotes.length === 0 ? "No hay cotizaciones registradas." : "Sin resultados para la búsqueda."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-800">
                  {["Cliente", "Estado", "Válida hasta", "Total", "Acciones"].map((h) => (
                    <TableCell
                      key={h}
                      isHeader
                      className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => {
                  const status = STATUS_CONFIG[quote.status];
                  return (
                    <TableRow
                      key={quote.id}
                      className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50 dark:border-gray-800/50 dark:hover:bg-white/2"
                    >
                      <TableCell className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{quote.customerName}</p>
                        {quote.contactNumber && <p className="text-xs text-gray-400">{quote.contactNumber}</p>}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(quote.validUntil)}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                        {formatCurrency(Number(quote.totalValue))}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          {quote.status === "pending" && (
                            <>
                              <button
                                title="Aceptar"
                                onClick={() => handleStatusChange(quote.id, "accepted")}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20"
                              >
                                <Check className="size-4" />
                              </button>
                              <button
                                title="Rechazar"
                                onClick={() => handleStatusChange(quote.id, "rejected")}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                              >
                                <X className="size-4" />
                              </button>
                            </>
                          )}
                          <button
                            title="Ver / Descargar PDF"
                            onClick={() => navigate(`/admin/quotes/${quote.id}/print`)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                          >
                            <FileText className="size-4" />
                          </button>
                          <button
                            title="Editar"
                            onClick={() => navigate(`/admin/quotes/${quote.id}/edit`)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            title="Eliminar"
                            onClick={() => handleDelete(quote.id)}
                            disabled={deletingId === quote.id}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 disabled:opacity-50"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default QuotesPage;
