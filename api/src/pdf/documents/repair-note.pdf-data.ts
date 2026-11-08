import { RepairNote } from "../../repair-notes/entities/repair-note.entity.js";
import { Local } from "../../local/entities/local.entity.js";

export interface RepairNotePdfData {
  controlNumber: number;
  customerName: string;
  contactNumber: string | null;
  brand: string;
  model: string;
  reportedFailure: string;
  totalValue: number;
  requiresAdvance: boolean;
  advanceValue: number | null;
  receivedAt: string;
  deliveryDate: string | null;
  assignedEmployeeName: string | null;
  technicianNotes: string | null;
  serviceRepair: boolean;
  serviceMaintenance: boolean;
  serviceDiagnostic: boolean;
  serviceRevision: boolean;
  serviceWaterDamage: boolean;
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
): RepairNotePdfData {
  return {
    controlNumber: note.controlNumber,
    customerName: note.customerName,
    contactNumber: note.contactNumber ?? null,
    brand: note.brand,
    model: note.model,
    reportedFailure: note.reportedFailure,
    totalValue: Number(note.totalValue),
    requiresAdvance: note.requiresAdvance,
    advanceValue: note.advanceValue != null ? Number(note.advanceValue) : null,
    receivedAt: note.receivedAt,
    deliveryDate: note.deliveryDate ?? null,
    assignedEmployeeName,
    technicianNotes: note.technicianNotes ?? null,
    serviceRepair: note.serviceRepair,
    serviceMaintenance: note.serviceMaintenance,
    serviceDiagnostic: note.serviceDiagnostic,
    serviceRevision: note.serviceRevision,
    serviceWaterDamage: note.serviceWaterDamage,
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
