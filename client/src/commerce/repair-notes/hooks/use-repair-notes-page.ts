import { useMemo, useState } from "react";

import type { RepairNoteRecord, RepairNoteStatus } from "../types/repair-note.types";

export const useRepairNotesPage = ({
  notes,
  deleteNote,
  cancelNote,
}: {
  notes: RepairNoteRecord[];
  deleteNote: (id: string) => Promise<boolean>;
  cancelNote: (id: string) => Promise<RepairNoteRecord | null>;
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RepairNoteStatus | "all">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.customerName.toLowerCase().includes(search.toLowerCase()) ||
        String(note.controlNumber).includes(search) ||
        note.brand.toLowerCase().includes(search.toLowerCase()) ||
        note.model.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || note.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [notes, search, statusFilter]);

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    await deleteNote(confirmDeleteId);
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  const confirmCancel = async () => {
    if (!confirmCancelId) return;
    setCancellingId(confirmCancelId);
    await cancelNote(confirmCancelId);
    setCancellingId(null);
    setConfirmCancelId(null);
  };

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    deletingId,
    cancellingId,
    filteredNotes,
    confirmDeleteId,
    setConfirmDeleteId,
    confirmCancelId,
    setConfirmCancelId,
    confirmDelete,
    confirmCancel,
  };
};
