import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Printer, Pencil, Trash2, Search } from "lucide-react";
import { useRepairNotes } from "../hooks/use-repair-notes";
import { STATUS_CONFIG } from "../types/repair-note.types";
import type { RepairNoteStatus } from "../types/repair-note.types";
import Button from "@ui/button/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@ui/table/table";

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);

const RepairNotesPage: React.FC = () => {
  const navigate = useNavigate();
  const { notes, loading, error, fetchNotes, deleteNote } = useRepairNotes();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RepairNoteStatus | "all">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filtered = notes.filter((n) => {
    const matchesSearch =
      n.customerName.toLowerCase().includes(search.toLowerCase()) ||
      String(n.controlNumber).includes(search) ||
      n.brand.toLowerCase().includes(search.toLowerCase()) ||
      n.model.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || n.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta nota de reparación?")) return;
    setDeletingId(id);
    await deleteNote(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400">
            Notas de Reparación
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona el taller de reparación de celulares.
          </p>
        </div>
        <Button
          variant="primary"
          startIcon={<Plus className="size-4" />}
          onClick={() => navigate("/admin/repair-notes/new")}
        >
          Nueva nota
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, equipo o # control..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RepairNoteStatus | "all")}
          className="rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="all">Todos los estados</option>
          <option value="received">Recibido</option>
          <option value="in_repair">En Reparación</option>
          <option value="done">Listo</option>
          <option value="delivered">Entregado</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Cargando notas...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {notes.length === 0 ? "No hay notas registradas." : "Sin resultados para la búsqueda."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-800">
                  {["#", "Cliente", "Equipo", "Estado", "Recibido", "Total", "Acciones"].map(
                    (h) => (
                      <TableCell
                        key={h}
                        isHeader
                        className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        {h}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((note) => {
                  const status = STATUS_CONFIG[note.status as RepairNoteStatus];
                  return (
                    <TableRow
                      key={note.id}
                      className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50 dark:border-gray-800/50 dark:hover:bg-white/[0.02]"
                    >
                      <TableCell className="px-4 py-4 text-sm font-semibold text-gray-800 dark:text-white/90">
                        #{note.controlNumber}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {note.customerName}
                        </p>
                        {note.contactNumber && (
                          <p className="text-xs text-gray-400">{note.contactNumber}</p>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {note.brand} {note.model}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status?.className ?? ""}`}
                        >
                          {status?.label ?? note.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(note.receivedAt)}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                        {formatCurrency(Number(note.totalValue))}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            title="Imprimir"
                            onClick={() => navigate(`/admin/repair-notes/${note.id}/print`)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                          >
                            <Printer className="size-4" />
                          </button>
                          <button
                            title="Editar"
                            onClick={() => navigate(`/admin/repair-notes/${note.id}/edit`)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            title="Eliminar"
                            onClick={() => handleDelete(note.id)}
                            disabled={deletingId === note.id}
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
    </div>
  );
};

export default RepairNotesPage;
