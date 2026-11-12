import { RepairNote } from "../../../commerce/repair-notes/entities/repair-note.entity.js";
import { Local } from "../../../app_platform/local/entities/local.entity.js";

export interface RepairNotePdfData {
  controlNumber: number;
  customerName: string;
  contactNumber: string | null;
  brand: string;
  model: string;
  reportedFailure: string;
  additionalFindings: string | null;
  totalValue: number;
  requiresAdvance: boolean;
  advanceValue: number | null;
  receivedAt: string;
  deliveryDate: string | null;
  assignedEmployeeName: string | null;
  technicianNotes: string | null;
  serviceTypeNames: string[];
  deviceOff: boolean;
  hasWarranty: boolean;
  hasExtendedWarranty: boolean;
  extendedWarrantyDays: number | null;
  local: {
    name: string | null;
    address: string | null;
    phone: string | null;
    logo: string | null;
  };
}

export function toRepairNotePdfData(
  note: RepairNote,
  local: Local | null,
  assignedEmployeeName: string | null = null,
  serviceTypeNames: string[] = [],
): RepairNotePdfData {
  return {
    controlNumber: note.controlNumber,
    customerName: note.customerName,
    contactNumber: note.contactNumber ?? null,
    brand: note.brand,
    model: note.model,
    reportedFailure: note.reportedFailure,
    additionalFindings: note.additionalFindings ?? null,
    totalValue: Number(note.totalValue),
    requiresAdvance: note.requiresAdvance,
    advanceValue: note.advanceValue != null ? Number(note.advanceValue) : null,
    receivedAt: note.receivedAt,
    deliveryDate: note.deliveryDate ?? null,
    assignedEmployeeName,
    technicianNotes: note.technicianNotes ?? null,
    serviceTypeNames,
    deviceOff: note.deviceOff,
    hasWarranty: note.hasWarranty,
    hasExtendedWarranty: note.hasExtendedWarranty,
    extendedWarrantyDays: note.extendedWarrantyDays ?? null,
    local: {
      name: local?.name ?? null,
      address: local?.address ?? null,
      phone: local?.phone ?? null,
      logo: local?.logo ?? null,
    },
  };
}
