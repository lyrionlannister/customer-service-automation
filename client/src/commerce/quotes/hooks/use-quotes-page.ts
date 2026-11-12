import { useMemo, useState } from "react";

import type { QuoteStatus } from "./use-quotes";

export const useQuotesPage = ({
  quotes,
  deleteQuote,
  setStatus,
}: {
  quotes: Array<{
    id: string;
    customerName: string;
    contactNumber: string | null;
    status: QuoteStatus;
    validUntil: string | null;
    totalValue: number;
  }>;
  deleteQuote: (id: string) => Promise<boolean>;
  setStatus: (id: string, status: QuoteStatus) => Promise<boolean>;
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      const matchesSearch = quote.customerName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotes, search, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta cotización?")) return;
    setDeletingId(id);
    await deleteQuote(id);
    setDeletingId(null);
  };

  const handleStatusChange = async (id: string, status: QuoteStatus) => {
    await setStatus(id, status);
  };

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    deletingId,
    filteredQuotes,
    handleDelete,
    handleStatusChange,
  };
};
